/* eslint-disable no-else-return */
/* eslint-disable eqeqeq */
/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-else-return
import { LightningElement, api, track } from 'lwc';
import getDataFromDataResource from '@salesforce/apex/RequestPayloadGenerator.process';

// import ICGateway from "@salesforce/apex/ICGateway.executeMethod";
import { showCustomToast, showError } from 'c/utils';
import saveDataSource from '@salesforce/apex/DataSourceController.SaveDataSource';
export default class DataSourceHeader extends LightningElement {
    @api documentTemplateId; @api updatedList; @api externalTemplateId; @api jsonData;
    @track additionalData = {
        "convertTo": "pdf"
    };
    content = JSON.stringify({
        "convertTo": {
            "formatName": "pdf",
            "formatOptions": {
                "EncryptFile": "true",
                "DocumentOpenPassword": "",
                "Watermark": ""
            }
        }
    }, null, 4);

    jsonDatachange;
    connectedCallback() {
        console.log('--=-- inside the connected call back data source header')
        this.dispatchEvent(new CustomEvent('additionaldata', {
            detail: { additionalJsonData: this.additionalData },
            bubbles: true
        }));
    }
    showSpinner = false;
    isModalOpen = false;
    handlePreview(event) {
        this.showSpinner = true;
        getDataFromDataResource({ documentTemplate: this.documentTemplateId })
            .then(res => {
                let JsonEditorData = JSON.parse(JSON.stringify(res));
                console.log('JsonEditorData' + JSON.stringify(JsonEditorData));
                this.dispatchEvent(new CustomEvent('preview', {
                    detail: { isPreview: true, JsonData: JsonEditorData },
                    bubbles: true
                }));
                this.showSpinner = false
            })
            .catch(err => {

                showError(this, err.body.message);
                this.showSpinner = false;
            })
    }
    HandleSaveAllDataSources() {
        this.showSpinner = true
        let existingList = [...this.updatedList];
        let updatedArray = JSON.parse(JSON.stringify(existingList)).map(data => {
            if (data.Type__c == 'object') {
                data.Handler_Name__c = data.Handler_Name__c.join(",")
            }
            data.hasError = (data.Name.trim() == "") || (data.Handler_Name__c.trim() === '');
            return data;
        }); //map which gives you the updatedArray of Errors data;
        let noErrorArray = []
        updatedArray.forEach(data => {
            if (data.hasError === false) {
                noErrorArray.push(data)
            }
        });
        saveDataSource({ dataSource: JSON.stringify(noErrorArray) }) //save all data sources 
            .then(response => {
                console.log("--==-- response --=--" + JSON.stringify(response))
                let newPromise = new Promise(function (resolve) {

                    let responseArray = JSON.parse(JSON.stringify(response)).map(obj => {
                        return { ...obj, isNew: false, activeItem: "", Saved: true, hasError: false }
                    })// when new data sources added the old array of object value isActive should be false;
                    resolve(responseArray);
                })
                    .then(updatedData => {
                        let updatedArrayAfterSaveAll = JSON.parse(JSON.stringify(updatedArray)).map(newItem => {
                            updatedData.map(resdata => {
                                if (newItem.Order__c === resdata.Order__c) {
                                    newItem['Id'] = resdata.Id
                                    newItem['Saved'] = true
                                    newItem['hasError'] = false
                                }
                            })
                            return newItem;
                        });
                        this.dispatchEvent(new CustomEvent('savealldatasources', {
                            detail: { saveAllDataSources: JSON.parse(JSON.stringify(updatedArrayAfterSaveAll)) },
                            bubbles: true
                        })) //dispatching the updated data source arrray to the parent data source component
                        this.showSpinner = false
                        showCustomToast(this, 'Success', 'All Data Sources Saved Successfully.', 'success');

                    })
            })
            .catch(err => showError(this, err.responseBody.message));
    }
    renderReport() {
        this.dispatchEvent(new CustomEvent('renderreport', {
            detail: { hasRender: true },
            bubbles: true
        })) //dispatching the updated data source arrray to the parent data source component
    }
    editSettingJson() {
        this.isModalOpen = true
    }
    closeModal() {
        this.isModalOpen = false
    }
    getHandleChangeJsonData(event) {
        this.jsonDatachange = event.detail.json;
    }
    handleSaveJson() {
        this.additionalData.convertTo = this.jsonDatachange.convertTo

        console.log('--=-- handle save edit json --=--' + JSON.stringify(this.additionalData));
        this.dispatchEvent(new CustomEvent('formatoptions', {
            detail: { additionalJsonData: this.additionalData },
            bubbles: true
        }));
        // this.dispatchEvent(new CustomEvent('formatoptions', {
        //     detail: { additionalJsonData: this.additionalData },
        //     bubbles: true
        // }));
        // console.log('--=-- final additoinal data will be --=--' + JSON.stringify(this.additionalData));
        this.isModalOpen = false;
    }
}