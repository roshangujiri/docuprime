/* eslint-disable @lwc/lwc/no-api-reassignments */
/* eslint-disable eqeqeq */
import { LightningElement, api, track, wire } from 'lwc';
import ICGateway from "@salesforce/apex/ICGateway.executeMethod";
import getAddTemplateFromCustomMdt from '@salesforce/apex/DataSourceController.queryMetadata';
import { requestWrapperForUpload, showCustomToast, requestWrapperForGetTemplate, showError } from 'c/utils';
export default class DataSourceSection extends LightningElement {

    fileData;
    base64Data;
    @track uploadFileDetails;
    @api documentTemplateId;
    @api arrayList;
    @api divClass;
    @api isOpenSideBar;
    @api articleAreaHidden;
    @api iconName;
    loadingSpinner = false;
    areaCurrent = "";
    borderClass = ''
    progress = 0;
    // Drag and drop  Star
    @track dragStart;
    @api isInstallLwapic;
    DragStart(event) {
        this.dragStart = event.target.accessKey;
        console.log('event.target.title' + JSON.stringify(event.target.accessKey));
        event.target.classList.add("drag");
    }
    DragOver(event) {
        event.preventDefault();
        return false;
    }
    Drop(event) {
        // this.loadingSpinner = true;
        event.stopPropagation();
        let existingArray = [...this.arrayList]
        const DragValName = this.dragStart;
        const DropValName = event.target.accessKey;

        if (DragValName === DropValName) {
            this.loadingSpinner = false
            return false;
        }
        const currentIndex = DragValName;
        const newIndex = DropValName;
        arraymove(JSON.parse(JSON.stringify(existingArray)), currentIndex, newIndex);
        function arraymove(arr, fromIndex, toIndex) {
            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
            existingArray = [...arr];
        }
        let index = 0;
        let newArray = JSON.parse(JSON.stringify(existingArray)).map(data => {
            data.Order__c = index + 1;
            // data.Saved = false
            index++;
            return data
        }); //looping throuhg the data to change the index of the list;
        console.log('--=-- New Array is --=--' + JSON.stringify(newArray));
        // this.arrayList = [...newArray];
        this.dispatchEvent(new CustomEvent('draglist', {
            detail: {
                newDragArray: newArray
            },
            bubbles: true
        }))

        this.loadingSpinner = false

    }

    // drag and drop End
    handleToggleSection() { }
    HandleCloseSideBar() {
        if (this.iconName == 'utility:left') {
            console.log("inside the if in section")
            this.dispatchEvent(new CustomEvent('closesection', {
                detail: { isSectionClose: true },
                bubbles: true
            }))
        }
        else {
            this.dispatchEvent(new CustomEvent('closesection', {
                detail: { isSectionClose: false },
                bubbles: true
            }));
        }
    }
    AddDataSource() {
        this.dispatchEvent(new CustomEvent('actionclick', {
            detail: { showSection: true, },
            bubbles: true
        }))
    };
    HandleGetIndex(event) {
        const index = event.target.dataset.item;
        console.log('--=-- index of the selected item  --=--' + JSON.stringify(index));
        console.log('this.array list in sata spurce section is --=--' + JSON.stringify(this.arrayList));
        let selectedArray = JSON.parse(JSON.stringify(this.arrayList)).map(data => {
            if (data.Order__c == index) {
                data.isNew = true;
                data.activeItem = "page"
            }
            else {
                data.isNew = false;
                data.activeItem = ""
            }
            return data;
        })
        this.areaCurrent = "page";
        console.log('--=-- inside source list array --=--' + JSON.stringify(selectedArray));
        this.dispatchEvent(new CustomEvent('actionkeyindex', {
            detail: {
                editSourceType: JSON.parse(JSON.stringify(selectedArray[event.target.accessKey].Type__c)),
                sourceListArray: JSON.parse(JSON.stringify(selectedArray)),
                isdsBody: true
            },
            bubbles: true
        }))
    }
    getAddTemplateDetails(file) {
        this.loadingSpinner = true;
        getAddTemplateFromCustomMdt({ serviceName: 'Add_Template' })
            .then(data => {
                let EndpointUrl = data[0].Carbone_url__c;
                let method = data[0].Method__c;
                let carboneVersion = data[0].Carbone_Version__c;
                let authorizationToken = data[0].Authorization_Token__c;
                let uploadFile = {
                    template: this.base64Data
                };
                fetch(EndpointUrl, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorizationToken,
                        'carbone-version': carboneVersion
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify(uploadFile)
                })
                    .then((response) => response.json())
                    .then((response) => {
                        this.loadingSpinner = false;
                        let externalTemplateId = response.data.templateId;
                        console.log(externalTemplateId);
                        let title = `${this.fileData.filename} Uploaded successfully!!`
                        showCustomToast(this, 'Success', title, 'success');
                        this.dispatchEvent(new CustomEvent('getexternaltemplateid', {
                            detail: {
                                externalTemplateId: externalTemplateId
                            },
                            bubbles: true
                        }))
                    })
                    .catch(err => {
                        this.loadingSpinner = fale;
                        showError(this, err.body.message);
                    })
            })
            .catch(err => {
                this.loadingSpinner = fale;
                showError(this, err.body.message);

            })
    }
    openfileUpload(event) {
        console.log("--=-- inside the opwn file upload  --=--")
        const file = event.target.files[0];
        // alert('file size is' + file.size);
        var reader = new FileReader();
        reader.onload = () => {
            var base64 = reader.result.split(',')[1];
            this.base64Data = base64;
            this.uploadFileDetails = {
                template: base64
            };
            this.fileData = {
                'filename': file.name,
                'base64': base64,
            }
        }
        reader.readAsDataURL(file);
        console.log('--=-- file is --=--' + JSON.stringify(file));

    }
    uploadTemplate() {
        console.log('--=-- inside the upload template --=--');
        if (!this.base64Data) {
            showError(this, 'Please Select the file.');
        }
        else {
            this.loadingSpinner = true;
            //  console.log('--=-- inside the else block base64' + JSON.stringify(this.base64Data));
            let data = requestWrapperForUpload(`${this.base64Data}`);
            // console.log('--=-- request wrapper for upload  --=--' + JSON.stringify(data));
            if (this.isInstallLwapic) {

                ICGateway({ requestStr: JSON.stringify(data), documentTemplateId: this.documentTemplateId })
                    .then((res) => {
                        console.log("res in source sections" + JSON.stringify(res))
                        if (res.response[0].responseBody) {
                            let externalTemplateId = JSON.parse(res.response[0].responseBody).data.templateId;
                            console.log("this.externalTemplateId" + externalTemplateId);
                            let title = `${this.fileData.filename} Uploaded successfully!!`
                            showCustomToast(this, 'Success', title, 'success');
                            this.progress = 100;
                            this.loadingSpinner = false;

                            this.fileData = '';
                            let getTemplate = requestWrapperForGetTemplate(`${externalTemplateId}`);
                            ICGateway({ requestStr: JSON.stringify(getTemplate) })
                                .then(result => {
                                    console.log('--result is for get template --=-- ' + JSON.stringify(result));
                                })
                                .catch(err => {
                                    console.log('--=-- error is --=--' + JSON.stringify(err));
                                })

                            this.dispatchEvent(new CustomEvent('getexternaltemplateid', {
                                detail: {
                                    externalTemplateId: externalTemplateId
                                },
                                bubbles: true
                            }))
                        }
                    })
                    .catch(err => {
                        console.log("error" + JSON.stringify(err))
                    })
            }
            else {
                this.getAddTemplateDetails(this.base64Data);

            }
        }
    }
    handleExternalTemplateId(event) {
        let externalId = event.target.value;
        this.dispatchEvent(new CustomEvent('externalid', {
            detail: {
                externalId: externalId
            },
            bubbles: true
        }))
    }
}