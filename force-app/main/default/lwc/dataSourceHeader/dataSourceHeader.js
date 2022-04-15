/* eslint-disable no-else-return */
/* eslint-disable eqeqeq */
/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-else-return
import { LightningElement, api, track } from 'lwc';
import getDataFromDataResource from '@salesforce/apex/RequestPayloadGenerator.process';

import ICGateway from "@salesforce/apex/ICGateway.executeMethod";
import { requestWrapperForRender, showCustomToast, showError, carboneRenderUrl } from 'c/utils';
import saveDataSource from '@salesforce/apex/DataSourceController.SaveDataSource';
export default class DataSourceHeader extends LightningElement {
    @api documentTemplateId; @api updatedList; @api externalTemplateId; @api jsonData;
    @track obj;
    @track additionalInfo = {
        "convertTo": {
            "formatName": "pdf",
            "formatOptions": {
                "EncryptFile": "true",
                "DocumentOpenPassword": "",
                "Watermark": ""
            }
        }
    };

    // connectedCallback() {
    //     this.obj = {
    //         "convertTo": {
    //             "formatName": "pdf",
    //             "formatOptions": {
    //                 "EncryptFile": "true",
    //                 "DocumentOpenPassword": "",
    //                 "Watermark": ""
    //             }
    //         }
    //     };
    //     this.additionalInfo = JSON.stringify(this.obj, null, 4);
    // }

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

        // this.showSpinner = true
        // console.log("inside the data source header render report line no 75");
        // console.log("--=-- external template id is --=--" + JSON.stringify(this.externalTemplateId));
        // console.log('--=-- updated json data is --=--' + JSON.stringify(this.jsonData));
        // //  let requestWrapper = requestWrapperForRender(this.externalTemplateId, JSON.parse(JSON.stringify(this.jsonData)));
        // let requestWrapperForRender = {
        //     request: {
        //         serviceName: `carbone_render`,
        //         queryParams: `${this.externalTemplateId}`,
        //         requestPayload: JSON.parse(JSON.stringify(this.jsonData))
        //     }
        // }
        // ICGateway({ requestStr: JSON.stringify(requestWrapperForRender) })
        //     .then((res) => {
        //         console.log("inside the icGateway response");
        //         console.log('response is ' + JSON.stringify(JSON.stringify(res)));
        //         if (res.response[0].responseBody) {
        //             let renderId = JSON.parse(res.response[0].responseBody).data.renderId;
        //             let renderReportUrl = carboneRenderUrl + '/' + renderId;
        //             this.showSecondSection = false;
        //             this.dispatchEvent(new CustomEvent('renderreport', {
        //                 detail: { renderReportUrl: JSON.parse(JSON.stringify(renderReportUrl)) },
        //                 bubbles: true
        //             })) //dispatching the updated data source arrray to the parent data source component
        //             this.showSpinner = false
        //         }
        //     })
        //     .catch(err => {
        //         showError(this, err.responseBody.message);
        //     })


    }
    editSettingJson() {
        this.isModalOpen = true
    }
    closeModal() {
        this.isModalOpen = false
    }
    handleChangeJson(event) {
        this.additionalInfo = event.target.value
    }
    handleSaveJson() {
        console.log('--=-- json info --=--' + JSON.parse(JSON.stringify(this.additionalInfo)));
        this.isModalOpen = false;
    }
}