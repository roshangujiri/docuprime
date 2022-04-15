/* eslint-disable no-else-return */
/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */

import { LightningElement, track, api } from 'lwc';
import saveDataSource from '@salesforce/apex/DataSourceController.SaveDataSource';
import deleteDataSource from '@salesforce/apex/DataSourceController.deleteDataSources';
import { showCustomToast, showError } from 'c/utils';
import fetchFieldInfo from "@salesforce/apex/TemplateController.fetchFieldInfo";
export default class DataSourceBody extends LightningElement {
    isDataSource = false;
    @track templateData = {};
    @track disabledObjNTem = false;
    @api objectName;
    @track fetchChildObjects;
    refFields;
    @api sourceType; //public property coming from parent dataSource Component
    @api arrayList;
    @track sourceName = "";
    showSpinner = false;
    isModalOpen = false;
    @api isEditTemplate;
    @api documentTemplateId;
    @track textAreaLabel = '';
    @track listOfDataSource = [];
    @track isObject = false;
    @api containerClass;
    soqlQuery = false;
    restService = false;
    apexClass = false;
    channelName = false;

    isParentFieldSelectionOpen = false
    renderedCallback() {
        if (this.sourceType == 'query') {
            this.textAreaLabel = 'SOQL Query';
            this.sourceName = "SOQL";
            this.isObject = false;
            this.soqlQuery = true;
            this.restService = false;
            this.apexClass = false;
            this.channelName = false
        }
        else if (this.sourceType == 'restApi') {
            this.textAreaLabel = 'Rest Service Name';
            this.sourceName = "Rest Service";
            this.isObject = false;
            this.soqlQuery = false;
            this.restService = true;
            this.apexClass = false;
            this.channelName = false
        }
        else if (this.sourceType == 'className') {
            this.textAreaLabel = 'Apex Class Name';
            this.sourceName = "Apex Class";
            this.isObject = false;
            this.soqlQuery = false;
            this.restService = false;
            this.apexClass = true;
            this.channelName = false
        }
        else if (this.sourceType == 'channelName') {
            this.textAreaLabel = 'Channel Name';
            this.sourceName = "200 OK Channel";
            this.isObject = false;
            this.soqlQuery = false;
            this.restService = false;
            this.apexClass = false;
            this.channelName = true
        }
        else if (this.sourceType == 'object') {
            this.sourceName = `${this.objectName}`,
                this.isObject = true;
            this.soqlQuery = false;
            this.restService = false;
            this.apexClass = false;
            this.channelName = false
        }
        this.isDataSource = this.arrayList.length > 0 ? true : false;
        this.listOfDataSource = JSON.parse(JSON.stringify(this.arrayList)); //create a duplicate array
    }
    onChangeHandler(event) {
        if (event.target.name == 'sourceName') {
            this.listOfDataSource[event.target.accessKey].Name = event.target.value;
            this.listOfDataSource[event.target.accessKey].Saved = false;
        }
        if (event.target.name == 'handlerName') {
            this.listOfDataSource[event.target.accessKey].Handler_Name__c = event.target.value;
            this.listOfDataSource[event.target.accessKey].Saved = false;
        }
        if (event.target.name == 'input') {
            this.listOfDataSource[event.target.accessKey].Inputs__c = event.target.value;
            this.listOfDataSource[event.target.accessKey].Saved = false;
        }
        this.dispatchEvent(new CustomEvent('onchnagedata', {
            detail: { onchangeData: JSON.parse(JSON.stringify(this.listOfDataSource)) },
            bubbles: true
        }))
    }
    handleSave(event) {
        this.showSpinner = true
        let existingArray = [...JSON.parse(JSON.stringify(this.arrayList))]; //parsing the public array ( beacuse its not accesable in outside of the method);
        let selectedDataSource = [JSON.parse(JSON.stringify(existingArray[event.target.accessKey]))];
        // selectedDataSource.forEach(d=>{
        //     if(d.Handler_Name__c=='object'){
        //         d.Handler_Name__c =d.Handler_Name__c
        //     }
        // })
        // if (item.Type__c == 'object') {
        //     item.Handler_Name__c = item.Handler_Name__c(",")
        // }
        new Promise(function async(resolve) {
            let updatedArray = selectedDataSource.map(item => {
                if (item.Type__c == 'object') {
                    item.Handler_Name__c = item.Handler_Name__c.join(",")
                }
                item.hasError = ((item.Handler_Name__c.trim() === '' || item.Handler_Name__c === null) || (item.Name.trim() === ''))
                return item;
            });
            resolve(updatedArray);
        })
            .then(data => {
                console.log("--=-- data in source body --=--" + JSON.stringify(data))
                if (data[0].hasError === true) {
                    console.log("--=-- data --=--");
                    this.showSpinner = false
                    existingArray[event.target.accessKey] = data[0];
                    this.dispatchEvent(new CustomEvent('savedatasourcearray', {
                        detail: { savedDataList: JSON.parse(JSON.stringify(existingArray)) },
                        bubbles: true
                    })) //dispatching the updated data source arrray to the parent data source component;
                    showError(this, 'Please fill out required field(s).');
                }
                else {
                    // let anotherArray = [...JSON.parse(JSON.stringify(data))]
                    console.log("--=-- existing array is  --=--" + JSON.stringify((existingArray)));
                    saveDataSource({ dataSource: JSON.stringify(data) })
                        .then(response => {
                            console.log("--==-- response --=--" + JSON.stringify(response))
                            let newPromise = new Promise(function (resolve) {

                                let responseArray = JSON.parse(JSON.stringify(response)).map(obj => {
                                    return { ...obj, isNew: false, activeItem: "", Saved: true, hasError: false }
                                })// when new data sources added the old array of object value isActive should be false;
                                resolve(responseArray);
                            })
                                .then(updatedData => {
                                    console.log("--=--updatedData is  --=--" + JSON.stringify(updatedData));
                                    this.showSpinner = false
                                    let updatedArray = existingArray.map(newItem => {
                                        updatedData.map(resdata => {
                                            if (newItem.Order__c === resdata.Order__c) {
                                                newItem['Id'] = resdata.Id
                                                newItem['Saved'] = true
                                                newItem['hasError'] = false
                                            }
                                        })
                                        return newItem
                                    })
                                    console.log("--=-- new Updated array is --=--" + JSON.stringify(updatedArray));
                                    showCustomToast(this, 'Success', 'Data Source Saved successfully', 'success');
                                    this.dispatchEvent(new CustomEvent('savedatasourcearray', {
                                        detail: { savedDataList: JSON.parse(JSON.stringify(updatedArray)) },
                                        bubbles: true
                                    })) //dispatching the updated data source arrray to the parent data source component
                                })

                        })
                        .catch(err => console.log(err))
                }
            })
    }
    handleOpenConfirmation(event) {
        this.isModalOpen = true
    }
    closeModal() {
        this.isModalOpen = false;
    }
    handleDelete(event) {
        let existingArray = [...JSON.parse(JSON.stringify(this.arrayList))];
        console.log('--=-- existing array is --=--' + JSON.stringify(existingArray));
        let selectedDataSource = [JSON.parse(JSON.stringify(this.arrayList[event.target.accessKey]))];
        console.log('--=-- selected data source --=--' + JSON.stringify(selectedDataSource));
        let order = selectedDataSource[0].Order__c;
        let Id;
        const updatedArr = [];
        for (const arr of existingArray) {
            const { Order__c } = arr;
            if (Order__c != order) {
                if (Order__c > order) {
                    arr.Order__c -= 1;
                }
                updatedArr.push(arr)
            }
        }
        let savedList = []
        updatedArr.forEach(data => {
            if (data.Id) {
                savedList.push(data)
            }
        });
        console.log('--=--updated array is --=-- ' + JSON.stringify(updatedArr));
        console.log('--saved list is --=--' + JSON.stringify(savedList));
        if (selectedDataSource[0].Id) {
            Id = selectedDataSource[0].Id;
            deleteDataSource({ strId: Id, updatedArr: JSON.stringify(savedList) });
        }
        console.log('--=-- upadted array is --=-- ' + JSON.stringify(updatedArr));
        this.dispatchEvent(new CustomEvent('deletedatasource', {
            detail: { updatedArrayAfterDelete: JSON.parse(JSON.stringify(updatedArr)) },
            bubbles: true
        })) //dispatching the updated data source arrray to the parent data source component
        this.isModalOpen = false
        showCustomToast(this, 'Success', `Data Source ${selectedDataSource[0].Name} was Deleted. `, 'success');

    }
    handleRecordSelection(event) {
        let selectedValue = event.detail.channelName;
        console.log('--=--selected value is --==--' + JSON.stringify(selectedValue));
        console.log('--=-- source array is ' + JSON.stringify(this.listOfDataSource));
        let updatedArray = this.listOfDataSource.map(data => {
            if (data.isNew) {
                data.Handler_Name__c = selectedValue;
                return data
            }
            return data;
        });
        this.dispatchEvent(new CustomEvent('onchnagedata', {
            detail: { onchangeData: JSON.parse(JSON.stringify(updatedArray)) },
            bubbles: true
        }))


        // console.log('this.selected channel name is --=--' + JSON.stringify(selectedValue));
        // console.log('this.accessKey is' + JSON.stringify(event.target.accessKey));
        // this.listOfDataSource[event.target.accessKey].Handler_Name__c = selectedValue;
        // this.listOfDataSource[event.target.accessKey].Saved = false;
        // this.dispatchEvent(new CustomEvent('onchnagedata', {
        //     detail: { onchangeData: JSON.parse(JSON.stringify(this.listOfDataSource)) },
        //     bubbles: true
        // }));
        // console.log('--=-- handle record selctio --=--' + JSON.stringify(this.listOfDataSource));
    }


    //multiselect combobox
    handleChildFieldSelection(event) {
        console.log('--=-- handle child in data source body event.detail --=--' + JSON.stringify(event.detail));
        let selectedFields = [];
        for (var i = 0; i < event.detail.selectedValue.length; i++) {
            selectedFields.push(event.detail.selectedValue[i].recName);
        }
        console.log('--=-- selected fileds on data source body --=--' + JSON.stringify(selectedFields));
        console.log('--=-- selected fileds on data source body  length --=--' + JSON.stringify(selectedFields.length));
        // let objectFields = selectedFields.join(",")
        //  console.log("objectFields" + objectFields);
        // let objFileds = selectedFields.length == 0 ? '' : JSON.stringify(selectedFields);
        let updatedArray = this.listOfDataSource.map(data => {
            if (data.isNew) {
                data.Handler_Name__c = selectedFields
                return data
            }
            return data;
        });
        this.dispatchEvent(new CustomEvent('onchnagedata', {
            detail: { onchangeData: JSON.parse(JSON.stringify(updatedArray)) },
            bubbles: true
        }));
    };
    // handleParentFieldSelectionOpen(event) {

    //     this.isParentFieldSelectionOpen = true;

    // }

    // handleParentFieldSelectionClose(event) {

    //     this.isParentFieldSelectionOpen = false;
    // }

}