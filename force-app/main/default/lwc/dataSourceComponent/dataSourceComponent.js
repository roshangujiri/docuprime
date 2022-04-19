/* eslint-disable no-async-promise-executor */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import { LightningElement, track } from 'lwc';
import getDataSources from '@salesforce/apex/DataSourceController.FetchDataSource';
import getDataFromDataResource from '@salesforce/apex/RequestPayloadGenerator.process';
import saveDataSource from '@salesforce/apex/DataSourceController.SaveDataSource';
import { showCustomToast, showError } from 'c/utils';
export default class DataSourceComponent extends LightningElement {
    @track documentTemplateId = 'a040t0000052QRIAA2'; //the document template id wiil come when we are creating a template in docuprime when we save the template the id will come parent to here
    @track arrayList = [];                           //the main array it will store the JSON
    @track externalTemplateId;                      // store the external template id if we already have the template file it will first call in connected call back
    @track jsonEditorData = {};                          // when preview the document the json will store it here and passing it to the json editor component
    @track hasRender = false;                       //when all the data source get it will render all the child component 
    @track divClass = "slds-split-view_container slds-is-open section"; // passing dynamically the class is it open  or close and passing the styling(css:section)
    @track isOpenSideBar = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-open'; //passing the slds open side bar div class
    @track articleAreaHidden = 'false';  //passing to the data source section
    @track iconName = 'utility:left';    //passing the icon name dynamically
    @track data;                         // istring the final json data which is required to render the template

    isPreview = false;                   // variable is used if its true then it will show the json editor else data source body
    renderTemplate = false;              //used for of the mergerd template is ready then we will use in iframe
    showSecondSection = false;           //used for if the add data source section (i.e data source list show or hide);
    showSpinner = false;                 //showing the spinner when loading something
    isInstallLwapic = false;             //checking if lwapic/200Ok installed or not

    sourceType;                          //used for the type of the data source coming from data source list
    sourceLabel;                         // used for the data source label beacuse we will show into the data source body as header
    objectName;                          //getting the object which is there document template 
    additionalInfo;


    dsSectionSize = '4';                //initializing the data source section layout size
    dsSourceListSize = '';
    dsBodySize = '8';                   //Initializing the data source body layout size 
    dsJsonEditorSize;                   //Initializing the json editor layout size 
    dsIframeSize = '';                  //Initializing the Iframe layout size
    dsBodyDivClass = 'container';       //passing the styling class to the datasource body component
    closeDataSourceSection;             //Initializing and checking if the data source section is open or close
    jsonEditiorContainer = 'container-2'//Pasing the styling class to the json Editor component
    jsonEditorLayoutClass = '';         //Initializating the json editor layout size
    iframeLayoutClass = 'iframe';       //passing styling class to the iframe component


    async connectedCallback() {
        let type;
        this.showSpinner = true;
        let documentTemplateId = this.documentTemplateId;
        new Promise(async function (resolve) {
            let data = await getDataSources({ doucumentTemplateId: documentTemplateId });
            resolve(data)
        })
            .then(res => {
                console.log('--=-- connected call back data source component response  --=--' + JSON.stringify(res));
                this.externalTemplateId = res[0].Template_External_Id__c;
                this.objectName = res[0].Parent_Object_Name__c;
                res.forEach(x => {
                    if (x.lwapic) {
                        this.isInstallLwapic = true;
                    }
                    else {
                        this.isInstallLwapic = false
                    }
                })
                if (res[0].Data_Sources__r) {
                    console.log('--is Install lwapic --=--' + JSON.stringify(this.isInstallLwapic));
                    let responseArray = res[0].Data_Sources__r;
                    let updatedArray = JSON.parse(JSON.stringify(responseArray)).map(obj => {
                        if (obj.Type__c === 'object') {
                            obj.Handler_Name__c = obj.Handler_Name__c.split(',');
                            return { ...obj, isNew: false, activeItem: "", Saved: true, hasError: false };
                        }
                        return { ...obj, isNew: false, activeItem: "", Saved: true, hasError: false };
                    })                                    // when new data sources added the old array of object value isActive should be false;
                    updatedArray[0].isNew = true;         //to show the firstElement in the body
                    updatedArray[0].activeItem = 'page',  //changing the activeItem from empty to page so that it will active in data souce section
                        type = updatedArray[0].Type__c;       //fetching the type so that it will show the particular heading in data source body
                    this.sourceType = type;
                    this.arrayList = [...updatedArray];
                }
                else {
                    this.arrayList = [];
                }
                this.hasRender = true;
                this.showSpinner = false;
            })
    }
    handleSectionActionClick(event) {
        if (event.detail.showSection === true) {
            this.showSecondSection = true;
            this.jsonEditorLayoutClass = '';
        }
        else {
            this.showSecondSection = false;
            this.dsBodySize = '8';
            this.jsonEditorLayoutClass = '';
        }
    }
    HandleCloseSection(event) {
        if (event.detail.isSectionClose === true) {
            this.closeDataSourceSection = true;
            this.divClass = 'slds-split-view_container slds-is-closed sectionClose';
            this.isOpenSideBar = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-closed';
            this.articleAreaHidden = 'true';
            this.iconName = 'utility:right';
            this.dsBodySize = '11'
            this.dsBodyDivClass = 'container-2'
            this.dsSectionSize = '1';
            this.showSecondSection = false;
            if (this.renderTemplate) {
                this.jsonEditiorContainer = 'container-2';
                this.dsJsonEditorSize = '5';
                this.dsIframeSize = '6';
                this.jsonEditorLayoutClass = 'jsonEditor-2';
            }
            else {
                this.jsonEditorLayoutClass = '';
                this.dsJsonEditorSize = '11';
                this.dsIframeSize = '';
                this.showSecondSection = false;
            }
        }
        else if (event.detail.isSectionClose === false) {
            this.closeDataSourceSection = false;
            this.divClass = "slds-split-view_container slds-is-open section";
            this.isOpenSideBar = 'slds-button slds-button_icon slds-button_icon slds-split-view__toggle-button slds-is-open';
            this.articleAreaHidden = 'false';
            this.iconName = 'utility:left';
            this.dsBodySize = '8';
            this.dsSectionSize = '4';
            this.dsBodyDivClass = 'container';
            if (this.renderTemplate) {
                this.jsonEditorLayoutClass = 'jsonEditor';
                this.dsJsonEditorSize = '4';
                this.jsonEditiorContainer = 'container-1';
                this.dsIframeSize = '4'
            }
            else {
                this.dsJsonEditorSize = '8';
                this.jsonEditorLayoutClass = '';
            }
        }
    }
    // handleListOfDataFromQuery(event) {
    //     this.arrayList = JSON.parse(JSON.stringify(event.detail.dataSourceListFromQuery));
    // }
    handleSelectedSource(event) {
        this.jsonEditorLayoutClass = '';
        let type = event.detail.sourceType;
        if (type) {
            if (this.arrayList.length == 0) {
                if (type == 'restApi') {
                    this.sourceType = event.detail.sourceType;
                    this.sourceLabel = event.detail.sourceLabel;
                    let selectedSourceObj = {
                        Name: this.sourceLabel + ' ' + 1,
                        Order__c: 1,
                        Handler_Name__c: '/services/data/v53.0/sobjects/',
                        Type__c: type,
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
                    this.sourceType = event.detail.sourceType;
                    this.sourceLabel = event.detail.sourceLabel;
                    let selectedSourceObj = {
                        Name: this.sourceLabel + ' ' + 1,
                        Order__c: 1,
                        Handler_Name__c: '',
                        Type__c: type,
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
                if (type == 'restApi') {
                    this.sourceType = event.detail.sourceType;
                    this.sourceLabel = event.detail.sourceLabel;
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
                        Type__c: type,
                        Inputs__c: '',
                        Active__c: false,
                        Document_Template__c: this.documentTemplateId,
                        isNew: true,
                        Saved: false,
                        activeItem: "page",
                        hasError: false,
                    }
                    newDataSourceArray.push(selectedSourceObj);
                    this.arrayList = newDataSourceArray; //updating the array list
                }
                else if (type == 'object') {
                    let isObject;
                    for (var i = 0; i < this.arrayList.length; i++) {
                        if (this.arrayList[i].Type__c == 'object') {
                            isObject = true;
                            break;
                        }
                        else {
                            isObject = false;
                        }
                    }
                    if (isObject) {
                        this.showSecondSection = false;
                        return showError(this, 'Already you have selected Object Please Edit.')
                    }
                    else {
                        this.sourceType = event.detail.sourceType;
                        this.sourceLabel = event.detail.sourceLabel;
                        let newDataSourceArray = this.arrayList.map(obj => {
                            return { ...obj, isNew: false, activeItem: "" }
                        })// when new data sources added the old array of object value isActive should be false;
                        let lastIndex = this.arrayList.slice(-1)[0].Order__c //getting the last insex of an array to increment and decrement the index of an array
                        let updatedIndex = lastIndex + 1
                        let selectedSourceObj = {
                            Order__c: lastIndex + 1,
                            Name: this.sourceLabel + ' ' + updatedIndex,
                            Handler_Name__c: '',
                            Type__c: type,
                            Inputs__c: '',
                            Active__c: false,
                            Document_Template__c: this.documentTemplateId,
                            isNew: true,
                            Saved: false,
                            activeItem: "page",
                            hasError: false,
                        }
                        newDataSourceArray.push(selectedSourceObj);
                        this.arrayList = newDataSourceArray; //updating the array list
                    }
                }
                else {
                    this.sourceType = event.detail.sourceType;
                    this.sourceLabel = event.detail.sourceLabel;
                    //checking if the object details are there or not 
                    //else we have to take last index of an array object and increment when new data source is added
                    let newDataSourceArray = this.arrayList.map(obj => {
                        return { ...obj, isNew: false, activeItem: "" };
                    })// when new data sources added the old array of object value isActive should be false;
                    let lastIndex = this.arrayList.slice(-1)[0].Order__c //getting the last insex of an array to increment and decrement the index of an array
                    let updatedIndex = lastIndex + 1
                    let selectedSourceObj = {
                        Order__c: lastIndex + 1,
                        Name: this.sourceLabel + ' ' + updatedIndex,
                        Handler_Name__c: '',
                        Type__c: type,
                        Inputs__c: '',
                        Active__c: false,
                        Document_Template__c: this.documentTemplateId,
                        isNew: true,
                        Saved: false,
                        activeItem: "page",
                        hasError: false,
                    }
                    newDataSourceArray.push(selectedSourceObj);
                    this.arrayList = newDataSourceArray; //updating the array list
                }
            }
            this.showSecondSection = false;
            this.isPreview = false;
        }
        else {
            this.showSecondSection = true;
        }
    }
    handleCloseSourceTypeSection(event) {
        this.showSecondSection = event.detail.isSourceTypeOpen;
    }
    HandleOnChangeData(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.onchangeData));
    }
    getExternalTemplateId(event) {
        this.externalTemplateId = event.detail.externalTemplateId;
    }
    handleExternalId(event) {
        this.externalTemplateId = event.detail.externalId;
    }
    handleEditDataSources(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.sourceListArray));
        this.sourceType = event.detail.editSourceType;
        this.isPreview = false;
        this.showSecondSection = false;
        this.renderTemplate = false;
    }
    SaveDataSource(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.savedDataList));
    }
    SaveAllDataSoources(event) {
        this.arrayList = JSON.parse(JSON.stringify(event.detail.saveAllDataSources))
    }
    HandleDeleteSource(event) {
        let updatedArray = JSON.parse(JSON.stringify(event.detail.updatedArrayAfterDelete));
        if (updatedArray.length > 0) {
            updatedArray.slice(-1)[0].isNew = true;
            updatedArray.slice(-1)[0].activeItem = 'page';            //to show the last obj in datasource body
            this.sourceType = updatedArray.slice(-1)[0].Type__c;      //passin the source type to the datasource body
            this.arrayList = JSON.parse(JSON.stringify(updatedArray));// updated the array list 
        }
        else {
            this.arrayList = [...updatedArray];
        }
    }
    PreviewDocument(event) {
        let datajson = event.detail.JsonData;
        //   console.log('--=-- JSON Editor Data will be --=--' + JSON.stringify(this.jsonEditorData));
        this.jsonEditorData = { "data": { ...JSON.parse(JSON.stringify(datajson)) }, "convertTo": this.additionalInfo.convertTo };
        this.data = { "data": { ...JSON.parse(JSON.stringify(datajson)) }, "convertTo": this.additionalInfo.convertTo };
        this.isPreview = event.detail.isPreview;
        if (this.closeDataSourceSection) {
            this.jsonEditorLayoutClass = '';
            this.jsonEditiorContainer = 'container-2';
            this.dsJsonEditorSize = "11";
        }
        else {
            this.jsonEditorLayoutClass = ''
            this.dsJsonEditorSize = "8";
            this.jsonEditiorContainer = 'container-2';
        }
        this.renderTemplate = false;
        this.showSecondSection = false;
    }
    // getUpdatedJsonForRender(event) {
    //     this.data = JSON.parse(JSON.stringify(event.detail.updatedJsonData));
    // }
    renderReportFile(event) {
        if (this.isPreview == false) {
            getDataFromDataResource({ documentTemplate: this.documentTemplateId })
                .then(res => {
                    console.log('--=-- res from get data source in render template is  --=--' + JSON.stringify(res));
                    let previewData = JSON.parse(JSON.stringify(res));
                    this.jsonEditorData = { "data": { ...JSON.parse(JSON.stringify(previewData)) }, "convertTo": this.additionalInfo.convertTo };
                    this.data = { "data": { ...JSON.parse(JSON.stringify(previewData)) }, "convertTo": this.additionalInfo.convertTo };
                    console.log('--=-- this.data will be --=--' + JSON.stringify(this.data))
                    this.renderTemplate = true;
                    this.showSecondSection = false;
                    if (this.closeDataSourceSection) {
                        this.jsonEditorLayoutClass = 'jsonEditor-2'
                        this.isPreview = true

                        this.dsJsonEditorSize = '5';
                        this.dsIframeSize = '6';

                    }
                    else {
                        this.jsonEditorLayoutClass = 'jsonEditor'
                        this.isPreview = true;
                        this.dsJsonEditorSize = '4';
                        this.dsIframeSize = '4';

                    }

                })
                .catch(err => {
                    console.log('--=-- error message will be --=--' + JSON.stringify(err))
                    //  showError(this, err.body.message);
                    this.showSpinner = false;
                })
        }
        else {
            // this.data = { "data": { ...JSON.parse(JSON.stringify(data)) }, "convertTo": this.additionalInfo.convertTo };
            console.log('--=-- else block data source render template  --=--' + JSON.stringify(this.data))
            this.renderTemplate = true;
            this.showSecondSection = false;
            if (this.closeDataSourceSection) {
                this.isPreview = true
                this.jsonEditorLayoutClass = 'jsonEditor-2'
                this.dsJsonEditorSize = '5';
                this.dsIframeSize = '6';

            }
            else {
                this.isPreview = true
                this.jsonEditorLayoutClass = 'jsonEditor'
                this.dsJsonEditorSize = '4';
                this.dsIframeSize = '4';

            }

        }
        //  console.log('--== in render template line no 355 --=--' + JSON.stringify(this.data))
        // this.renderTemplate = true;
        // this.showSecondSection = false;
        // if (this.closeDataSourceSection) {
        //     this.isPreview = true
        //     this.jsonEditorLayoutClass = 'jsonEditor-2'
        //     this.dsJsonEditorSize = '5';
        //     this.dsIframeSize = '6';

        // }
        // else {
        //     this.isPreview = true
        //     this.jsonEditorLayoutClass = 'jsonEditor'
        //     this.dsJsonEditorSize = '4';
        //     this.dsIframeSize = '4';

        // }
    }
    dragList(event) {
        this.showSpinner = true;
        let dragArrayList = event.detail.newDragArray;
        let savedArray = [];
        JSON.parse(JSON.stringify(dragArrayList)).forEach(data => {
            if (data.Saved) {
                savedArray.push(data);
            }
        });
        saveDataSource({ dataSource: JSON.stringify(savedArray) })
            .then(res => {
                this.arrayList = [...dragArrayList];
                this.showSpinner = false;
            })
            .catch(err => {
                return showError(this, err.body.message);
            });
    }
    HandleAdditionalJsonData(event) {
        console.log('event.detail.additionalJsonData' + JSON.stringify(event.detail.additionalJsonData))
        this.additionalInfo = event.detail.additionalJsonData;
        console.log('event.detail.additionalJsonData 1' + JSON.stringify(this.additionalInfo))

    }
    handleFormatOptionsForJson(event) {
        //  console.log('--=-- inside the changing the json ')
        this.additionalInfo = event.detail.additionalJsonData;
        console.log(' this.additionalInfo' + JSON.stringify(this.additionalInfo))
        //  this.jsonEditorData.convertTo = event.detail.additionalJsonData;
        //console.log('--=-- this.additional info is --=--' + JSON.stringify(this.additionalInfo))
        if (this.renderTemplate == true) {
            console.log('--=-- inside the render  template')
            this.renderReportFile();
        }
        else if (this.isPreview == true) {
            this.jsonEditorData.convertTo = this.additionalInfo.convertTo;
            console.log('--=-- handel save json additional input --=--' + JSON.stringify(this.jsonEditorData));
            this.jsonEditorData = JSON.parse(JSON.stringify(this.jsonEditorData));
        }


    }
}