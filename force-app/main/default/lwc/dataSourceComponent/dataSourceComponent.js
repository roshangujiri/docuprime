/* eslint-disable no-async-promise-executor */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import { LightningElement, track } from 'lwc';
import getDataSources from '@salesforce/apex/DataSourceController.FetchDataSource';
import saveDataSource from '@salesforce/apex/DataSourceController.SaveDataSource';
import { showCustomToast, showError } from 'c/utils';
export default class DataSourceComponent extends LightningElement {
    isPreview = false;
    renderTemplate = false
    showEditTemplate = true
    showSecondSection = false;
    sourceType;
    sourceLabel;
    index = 0;
    IsEditTemplate = false;
    @track dataSourceIndex;
    @track sourceListForEditSection = [];
    @track jsonEditorData;
    @track documentTemplateId = 'a040t0000052QRIAA2'
    @track externalTemplateId;
    @track arrayList = [];
    @track hasRender = false; //when all the data source get it will render all the child component 
    @track divClass = "slds-split-view_container slds-is-open section";
    @track isOpenSideBar = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-open';
    @track articleAreaHidden = 'false';
    @track iconName = 'utility:left';
    showSpinner = false;
    @track renderTemplateUrl;
    @track data;
    objectName;
    isInstallLwapic = false;
    //Start of then grid Size for compoentns
    dsSectionSize = '4';
    dsSourceListSize = '';
    dsBodySize = '8';
    dsJsonEditorSize;
    dsIframeSize = '';
    dsBodyDivClass = 'container';
    closeDataSourceSection;
    jsonEditiorContainer = 'container-2'
    jsonEditorLayoutClass = '';
    iframeLayoutClass = 'iframe';
    // End of the grid Size for all components
    //end of the data source section
    async connectedCallback() {
        let type;
        this.showSpinner = true;
        let documentTemplateId = this.documentTemplateId;
        new Promise(async function (resolve) {
            let data = await getDataSources({ doucumentTemplateId: documentTemplateId });
            resolve(data)
        })
            .then(res => {
                console.log('--response is --=--' + JSON.stringify(res));
                this.externalTemplateId = res[0].Template_External_Id__c;
                this.objectName = res[0].Parent_Object_Name__c;
                if (res[0].Data_Sources__r) {
                    let responseArray = res[0].Data_Sources__r;
                    let updatedArray = JSON.parse(JSON.stringify(responseArray)).map(obj => {
                        if (obj.Type__c === 'object') {
                            obj.Handler_Name__c = obj.Handler_Name__c.split(',')
                            return { ...obj, isNew: false, activeItem: "", Saved: true, hasError: false }
                        }
                        return { ...obj, isNew: false, activeItem: "", Saved: true, hasError: false }
                    })// when new data sources added the old array of object value isActive should be false;
                    updatedArray[0].isNew = true;         //to show the firstElement in the body
                    updatedArray[0].activeItem = 'page',  //changing the activeItem from empty to page so that it will active in data souce section
                        type = updatedArray[0].Type__c    //fetching the type so that it will show the particular heading in data source body
                    this.sourceType = type;
                    this.arrayList = [...updatedArray];
                    console.log('--array list in connected call back in data source section in connected call back--=--' + JSON.stringify(this.arrayList));
                }
                else {
                    this.arrayList = [];
                }
                this.hasRender = true;
                this.showSpinner = false
            })
    }
    handleSectionActionClick(event) {
        console.log('--=-- inside the handle section action click --=--');
        console.log("event.detail");
        if (event.detail.showSection === true) {
            this.showSecondSection = true;
        }
        else {
            console.log("insdie the elkse block");
            this.showSecondSection = false;
            this.dsBodySize = '8'
        }
    }
    HandleCloseSection(event) {
        if (event.detail.isSectionClose === true) {
            console.log("--=-- inside the if in parent --=--" + JSON.stringify(event.detail.isSectionClose));
            this.closeDataSourceSection = true;
            this.divClass = 'slds-split-view_container slds-is-closed sectionClose';
            this.isOpenSideBar = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-closed';
            this.articleAreaHidden = 'true'
            this.iconName = 'utility:right';
            this.dsBodySize = '11'
            this.dsBodyDivClass = 'container-2'
            this.dsSectionSize = '1';
            this.showSecondSection = false;
            if (this.renderTemplate) {
                this.jsonEditiorContainer = 'container-2'
                this.dsJsonEditorSize = '5';
                this.dsIframeSize = '6'
                this.jsonEditorLayoutClass = 'jsonEditor-2'
                //  this.template.querySelector('[data-id="editorLayout"]').className = `${this.jsonEditorLayoutClass}`;

            }
            else {
                //    this.template.querySelector('[data-id="editorLayout"]').className = ``;
                this.jsonEditorLayoutClass = ''
                this.dsJsonEditorSize = '11';
                this.dsIframeSize = ''
                this.showSecondSection = false
            }
        }
        else if (event.detail.isSectionClose === false) {

            // console.log('--=-- inside the else if in parent --=--' + JSON.stringify(event.detail.isSectionClose));
            this.closeDataSourceSection = false
            this.divClass = "slds-split-view_container slds-is-open section";
            this.isOpenSideBar = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-open';
            this.articleAreaHidden = 'false';
            this.iconName = 'utility:left';
            this.dsBodySize = '8'
            this.dsSectionSize = '4';
            this.dsBodyDivClass = 'container'

            if (this.renderTemplate) {
                this.jsonEditorLayoutClass = 'jsonEditor'
                //    this.template.querySelector('[data-id="editorLayout"]').className = `${this.jsonEditorLayoutClass}`;
                this.dsJsonEditorSize = '4';
                this.jsonEditiorContainer = 'container-1'
                this.dsIframeSize = '4'
            }
            else {
                //   this.template.querySelector('[data-id="editorLayout"]').className = ``
                this.dsJsonEditorSize = '8';
                this.jsonEditorLayoutClass = ''
            }
        }
    }
    handleListOfDataFromQuery(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.dataSourceListFromQuery))
    }
    handleSelectedSource(event) {
        this.sourceType = event.detail.sourceType;
        this.sourceLabel = event.detail.sourceLabel;
        console.log('--=--sourcetype in handle select data source --=--' + JSON.stringify(this.sourceType));
        if (this.sourceType) {
            if (this.arrayList.length == 0) {
                if (this.sourceType == 'restApi') {
                    let selectedSourceObj = {
                        Name: this.sourceLabel + ' ' + 1,
                        Order__c: 1,
                        Handler_Name__c: '/services/data/v53.0/sobjects/',
                        Type__c: this.sourceType,
                        Inputs__c: '',
                        Active__c: false,
                        Document_Template__c: this.documentTemplateId,
                        isNew: true,
                        Saved: false,
                        activeItem: 'page',
                        hasError: false,
                    }
                    this.arrayList.push(selectedSourceObj);
                }
                //if an array is empty we have take index as 0 and push to aarayList
                else {
                    let selectedSourceObj = {
                        Name: this.sourceLabel + ' ' + 1,
                        Order__c: 1,
                        Handler_Name__c: '',
                        Type__c: this.sourceType,
                        Inputs__c: '',
                        Active__c: false,
                        Document_Template__c: this.documentTemplateId,
                        isNew: true,
                        Saved: false,
                        activeItem: 'page',
                        hasError: false,
                    }
                    this.arrayList.push(selectedSourceObj);
                }
            }
            else {
                if (this.sourceType == 'restApi') {
                    //else we have to take last index of an array object and increment when new data source is added
                    let newDataSourceArray = this.arrayList.map(obj => {
                        return { ...obj, isNew: false, activeItem: "" }
                    })// when new data sources added the old array of object value isActive should be false;
                    let lastIndex = this.arrayList.slice(-1)[0].Order__c //getting the last insex of an array to increment and decrement the index of an array
                    let updatedIndex = lastIndex + 1
                    let selectedSourceObj = {
                        Order__c: lastIndex + 1,
                        Name: this.sourceLabel + ' ' + updatedIndex,
                        Handler_Name__c: '/services/data/v53.0/sobjects/',
                        Type__c: this.sourceType,
                        Inputs__c: '',
                        Active__c: false,
                        Document_Template__c: this.documentTemplateId,
                        isNew: true,
                        Saved: false,
                        activeItem: "page",
                        hasError: false,
                    }
                    newDataSourceArray.push(selectedSourceObj);
                    this.arrayList = newDataSourceArray; //updating the array list with
                }
                else if (this.sourceType == 'object') {
                    let isObject;
                    this.arrayList.forEach(object => {
                        // console.log('object is ' + JSON.stringify(object.Type__c));
                        if (object.Type__c != 'object') {
                            console.log('object type is ' + JSON.stringify(object.Type__c))
                            isObject = false
                        }
                        else {
                            console.log('object type is in else ' + JSON.stringify(object.Type__c));
                            isObject = true;
                        }
                    })
                    console.log('isObject' + JSON.stringify(JSON.stringify(isObject)));
                    if (isObject) {
                        console.log('already object is there')
                        return showError(this, 'Already you have selected Object Please Edit.')
                    }
                    else {
                        let newDataSourceArray = this.arrayList.map(obj => {
                            return { ...obj, isNew: false, activeItem: "" }
                        })// when new data sources added the old array of object value isActive should be false;
                        let lastIndex = this.arrayList.slice(-1)[0].Order__c //getting the last insex of an array to increment and decrement the index of an array
                        let updatedIndex = lastIndex + 1
                        let selectedSourceObj = {
                            Order__c: lastIndex + 1,
                            Name: this.sourceLabel + ' ' + updatedIndex,
                            Handler_Name__c: '',
                            Type__c: this.sourceType,
                            Inputs__c: '',
                            Active__c: false,
                            Document_Template__c: this.documentTemplateId,
                            isNew: true,
                            Saved: false,
                            activeItem: "page",
                            hasError: false,
                        }
                        newDataSourceArray.push(selectedSourceObj);
                        this.arrayList = newDataSourceArray; //updating the array list with
                    }
                }
                else {
                    //checking if the object details are there or not 
                    //else we have to take last index of an array object and increment when new data source is added
                    let newDataSourceArray = this.arrayList.map(obj => {
                        return { ...obj, isNew: false, activeItem: "" }
                    })// when new data sources added the old array of object value isActive should be false;
                    let lastIndex = this.arrayList.slice(-1)[0].Order__c //getting the last insex of an array to increment and decrement the index of an array
                    let updatedIndex = lastIndex + 1
                    let selectedSourceObj = {
                        Order__c: lastIndex + 1,
                        Name: this.sourceLabel + ' ' + updatedIndex,
                        Handler_Name__c: '',
                        Type__c: this.sourceType,
                        Inputs__c: '',
                        Active__c: false,
                        Document_Template__c: this.documentTemplateId,
                        isNew: true,
                        Saved: false,
                        activeItem: "page",
                        hasError: false,
                    }
                    newDataSourceArray.push(selectedSourceObj);
                    this.arrayList = newDataSourceArray; //updating the array list with
                }
            }
            this.IsEditTemplate = false;
            this.showSecondSection = false;
            this.isPreview = false;
        }
        else {
            this.IsEditTemplate = true;
            this.showSecondSection = true;
        }
    }
    handleCloseSourceTypeSection(event) {
        this.showSecondSection = event.detail.isSourceTypeOpen
    }
    HandleOnChangeData(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.onchangeData))
    }
    getExternalTemplateId(event) {
        this.externalTemplateId = event.detail.externalTemplateId
    }
    handleExternalId(event) {
        this.externalTemplateId = event.detail.externalId;
        console.log('--=-- externalTemplateId --=-- ' + JSON.stringify(this.externalTemplateId));
    }
    handleEditDataSources(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.sourceListArray));
        this.sourceType = event.detail.editSourceType;
        console.log('--=-- this.sourceType in parent --=--' + JSON.stringify(this.sourceType));
        this.isPreview = false;
        this.showSecondSection = false;
        this.renderTemplate = false;
    }

    SaveDataSource(event) {
        //  console.log(JSON.stringify(event.detail.savedDataList))
        this.arrayList = JSON.parse(JSON.stringify(event.detail.savedDataList));
    }
    SaveAllDataSoources(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.saveAllDataSources))
    }
    HandleDeleteSource(event) {
        let updatedArray = JSON.parse(JSON.stringify(event.detail.updatedArrayAfterDelete));
        console.log('--=-- updated array after delete --=--' + JSON.stringify(updatedArray));
        if (updatedArray.length > 0) {
            updatedArray.slice(-1)[0].isNew = true //to show the last obj in datasource body 
            this.sourceType = updatedArray.slice(-1)[0].Type__c; //passin the source type to the datasource body
            this.arrayList = JSON.parse(JSON.stringify(updatedArray)) // updated the array list 
            console.log('this.array list in handle delete if consition' + JSON.stringify(this.arrayList));
        }
        else {
            this.arrayList = [...updatedArray];
            console.log('this.array list in handle delete if consition' + JSON.stringify(this.arrayList));

        }

    }
    PreviewDocument(event) {
        this.jsonEditorData = event.detail.JsonData;
        this.isPreview = event.detail.isPreview;
        if (this.closeDataSourceSection) {
            this.jsonEditorLayoutClass = ''
            this.dsJsonEditorSize = "11";
        }
        else {
            this.jsonEditorLayoutClass = ''
            this.dsJsonEditorSize = "8";
        }
        //  this.dsJsonEditorSize = "8";
        this.renderTemplate = false;
        this.showSecondSection = false;
    }
    getUpdatedJsonForRender(event) {
        this.data = JSON.parse(JSON.stringify(event.detail.updatedJsonData));
    }
    renderReportFile(event) {
        this.renderTemplate = true;
        this.showSecondSection = false;
        if (this.closeDataSourceSection) {
            this.jsonEditorLayoutClass = 'jsonEditor-2'
            this.dsJsonEditorSize = '5';
            this.dsIframeSize = '6';
        }
        else {
            this.jsonEditorLayoutClass = 'jsonEditor'
            //  this.template.querySelector('[data-id="editorLayout"]').className = `${this.jsonEditorLayoutClass}`;
            this.dsJsonEditorSize = '4';
            this.dsIframeSize = '4';
        }
    }
    dragList(event) {
        this.showSpinner = true
        let dragArrayList = event.detail.newDragArray;
        let savedArray = [];
        JSON.parse(JSON.stringify(dragArrayList)).forEach(data => {
            if (data.Saved) {
                savedArray.push(data)
            }
        });
        saveDataSource({ dataSource: JSON.stringify(savedArray) })
            .then(res => {
                this.arrayList = [...dragArrayList];
                this.showSpinner = false
            })
            .catch(err => {
                console.log('--=-- error is  --=--' + JSON.stringify(err));
            })



    }
}