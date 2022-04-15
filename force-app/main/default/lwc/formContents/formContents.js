/* eslint-disable no-console */
import {
    LightningElement,
    wire,
    api,
    track
} from 'lwc';
import {
    showCustomToast,
    showError,
    formatDate,
    retrievePropertyIgnoreCase,
    reduceError,
    getSafeValue
} from 'c/utils';
import {
    createRecord
} from 'lightning/uiRecordApi';
import {
    getRecord
} from 'lightning/uiRecordApi';

import convertDate from '@salesforce/apex/TemplateIdentifierClass.convertDate'

/** Apex to fetch related records. */
import {
    refreshApex
} from '@salesforce/apex';
import getFormContentList from '@salesforce/apex/FormHandler.getFormContentList';
//ABDS:Added to get realtime data after save from preivew panel
import getFormContentListPreview from '@salesforce/apex/FormHandler.getFormContentListPreview';
import upsertDocContentList from '@salesforce/apex/FormHandler.upsertDocContentList';
import getNameofRecord from '@salesforce/apex/FormHandler.getNameofRecord';
import getCustomMarkup from '@salesforce/apex/FormHandler.getCustomMarkup';
import getCustomJSON from '@salesforce/apex/FormHandler.getCustomJSON';
import getRecordList from '@salesforce/apex/QueryController.getRecordList';
import getFieldLabelList from '@salesforce/apex/QueryController.getFieldLabelList';
import getCompletedRelationshipInfoList from '@salesforce/apex/QueryController.getCompletedRelationshipInfoList';
import getDocumentNameFromTemplateId from '@salesforce/apex/FormHandler.getDocumentNameFromTemplateId';
/** Apex to fetch related records. */
import getUserInfo from '@salesforce/apex/TransationalDataController.getUserInfo';
import getOrgInfo from '@salesforce/apex/TransationalDataController.getOrgInfo';
import getCustomSettings from '@salesforce/apex/TransationalDataController.getCustomSettings';
import getCustomMetaData from '@salesforce/apex/TransationalDataController.getCustomMetaData';
/** Corporate_Document__c Schema. */
import CORPORATE_OBJECT from '@salesforce/schema/Corporate_Document__c';
import VERSION_FIELD from '@salesforce/schema/Corporate_Document__c.Version__c';
import TEMPLATEID_FIELD from '@salesforce/schema/Corporate_Document__c.Document_Template__c';
import STAGE_FIELD from '@salesforce/schema/Corporate_Document__c.Document_Stage__c';
import RELATED_RECORD from '@salesforce/schema/Corporate_Document__c.Related_Record__c';
import CORPORATE_DOCUMENT_NAME from '@salesforce/schema/Corporate_Document__c.Name';

/** Document_Content__c Schema. */
import DOC_NAME_FIELD from '@salesforce/schema/Document_Content__c.Name';
import ORDER_SEQUENCE_FIELD from '@salesforce/schema/Document_Content__c.Order_Sequence__c';
import CONTENT_TYPE from '@salesforce/schema/Document_Content__c.Content_Type__c';
import ENABLE_LANDSCAPE_LAYOUT from '@salesforce/schema/Document_Content__c.Enable_Landscape_Layout__c';
import VISIBILITY from '@salesforce/schema/Document_Content__c.Visibility__c';
import ALIGNMENT from '@salesforce/schema/Document_Content__c.Alignment__c';
import SECTION_CONTENT_FIELD from '@salesforce/schema/Document_Content__c.Section_Content__c';
import CORPORATE_DOC_FIELD from '@salesforce/schema/Document_Content__c.Corporate_Document__c';
import QUERY_JSON_FIELD from '@salesforce/schema/Document_Content__c.Query_JSON__c';

/** Document_Template__c Schema. */

import TEM_DOC_NAME_FIELD from '@salesforce/schema/Document_Template__c.Name';

const fieldsTempName = [TEM_DOC_NAME_FIELD];
const TABLE_PLACEHOLDER = '[TABLE_PLACEHOLDER]';
const LOADING_TABLE_CONTENTS = '[TABLE_PLACEHOLDER] - Loading table contents...';
const CUSTOM_CONTENT_PLACEHOLDER = '[CUSTOM_CONTENT_PLACEHOLDER]';
const LOADING_CUSTOM_CONTENTS = '[CUSTOM_CONTENT_PLACEHOLDER] - Loading contents...';
const SECTION_LEVEL = 'Section Level';

/**Apex method calling */
import fetchMetadataIdentifiers from '@salesforce/apex/TemplateIdentifierClass.fetchMetadataIdentifierRecs';

/**App Setting Schema */
import START_IDENTIFIER from '@salesforce/schema/App_Settings__c.Start_Identifier__c';
import END_IDENTIFIER from '@salesforce/schema/App_Settings__c.End_Identifier__c';

/**
 * Component to create document from template.
 */
export default class FormContents extends LightningElement {

    @api recordId;

    @track metadataRecord;
    //ABDS:s:Added this for preview purpose
    @api isPreview = false;
    @track horizentalClass = 'content-section';

    //ABDS:s:Changed API to track
    @api objectApiName;
    @track isSaved = false;
    @api saveonload = 'false';

    @api formId;
    @track isCreateDocumentOpen = false;
    @track isLoadingPreview = false;
    @track contents = [];
    @track fields;
    @track isLoading;
    @track loadComplete = false;
    @track documentNameExtention = '';
    @track recordNamefield = ['Name'];
    @track nameData = [];
    fieldLabelList;
    displayFieldSet = false;
    mainContent = [];
    documentId;
    fieldValueMapList = [];
    name = '';
    renderedCounter = 0;
    refFields = [];
    nameFieldValue = '';
    response;
    records;
    wiredRecords;
    error;

    /*statusOptions = [
        { value: 'new', label: 'New', description: 'A new item' },
        {
            value: 'in-progress',
            label: 'In Progress',
            description: 'Currently working on this item',
        },
        {
            value: 'finished',
            label: 'Finished',
            description: 'Done working on this item',
        },
        { value: 'new1', label: 'New1', description: 'A new item' },
        { value: 'new2', label: 'New2', description: 'A new item' },
        { value: 'new3', label: 'New3', description: 'A new item' },
        { value: 'new4', label: 'New4', description: 'A new item' },
    ];

    value = 'new';*/


    @wire(getRecord, {
        recordId: '$formId',
        fields: fieldsTempName
    })
    templateDocumentData;

    @wire(getRecord, {
        recordId: '$recordId',
        fields: '$recordNamefield'
    })
    wiredgetRecordApi({
        error,
        data
    }) {
        //ABDS:s:e: Added if and else
        if (this.isPreview == false) {
            if (data) {
                this.objectApiName = data.apiName;
            } else if (error) {
                this.error = error;
                this.record = undefined;
            }
        } else {
            this.horizentalClass = '';
        }
    }

    @wire(getNameofRecord, {
        currentrecordId: '$recordId',
        objectApiName: '$objectApiName'
    })
    getNameofRecord({
        error,
        data
    }) {
        if (data) {
            if (data != null) {
                this.nameFieldValue = data[0].Name;
            } else if (error) {
                showError(this, error);
            }
        }
    }

    @wire(fetchMetadataIdentifiers)
    wiredRecs({
        error,
        data
    }) {
        if (data) {
            if (data != null) {
                this.metadataRecord = JSON.parse(data);
            }
        }
    }

    @api handleCreateNew(event, templateId = null) {
        this.isCreateDocumentOpen = true;
        if (templateId !== null) {
            getDocumentNameFromTemplateId({
                    templateId: templateId
                })
                .then(data => {
                    if (data) {
                        this.documentNameExtention = data;

                        if (this.isPreview) {
                            if (this.nameFieldValue) {
                                this.documentNameExtention = this.nameFieldValue;
                            }
                        }
                    }
                })
                .catch(error => {
                    showError(this, error);
                });

        } else if (this.nameFieldValue) {
            this.documentNameExtention = this.nameFieldValue;
        }

        //ABDS:s
        if (this.isPreview) {

            if (this.nameFieldValue) {
                this.documentNameExtention = this.nameFieldValue;
            }

            if (this.formId) {} else {
                this.formId = templateId;
            }
        }
        //ABDS:e

        //ABDS:s:e:Added only if and else condition
        if (this.isPreview == false) {
            if (event.currentTarget.dataset.id) {

                this.formId = event.currentTarget.dataset.id;

            } else if (templateId) {
                this.formId = templateId;
            }
        }
    }

    handleClose() {
        this.isCreateDocumentOpen = false;
        this.contents = [];
        this.formId = undefined;
        this.refFields = [];
        this.fieldValueMapList = [];
        this.documentNameExtention = '';
    }

    handleSave(event) {
        let isAllValid = this.validateFields();
        if (isAllValid) {
            this.createDocumentAndRelatedSections();
        } else {
            showError(this, 'Invalid Field values.');
        }
    }

    handleDocumentNameExtention(event) {
        this.documentNameExtention = event.target.value;
    }

    @wire(getRecord, {
        recordId: '$recordId',
        fields: '$refFields'
    })
    async wiredRecords({
        data,
        error
    }) {
        this.isLoadingPreview = true;
        console.log('wiredRecords>>' +  data );
        if (data && data.fields) {
            console.log('>>fieldValueMapList>>' + JSON.stringify(this.fieldValueMapList));
            for (let i in this.fieldValueMapList) {

                let fieldValueMap = this.fieldValueMapList[i];
                let fieldValue;

                if (!fieldValueMap.refField) {
                    continue;
                }

                console.log('refField==>' + fieldValueMap.refField);
                let fieldsList = fieldValueMap.refField.split('.');

                if (fieldValueMap.isHidden){
                    fieldValueMap.value=' ';
                    continue;
                }

                console.log('fieldsList==>' + fieldsList);
                console.log('data1');
                console.log(data);

                if (fieldsList.length === 2) {
                    if (this.fieldValueMapList[i].dateFormat === undefined && data.fields[fieldsList[1]].displayValue) {
                        fieldValue = data.fields[fieldsList[1]].displayValue;
                    } else {
                        fieldValue = data.fields[fieldsList[1]].value;
                    }
                } else if (fieldsList.length === 3) {
                    // check if it contains one relationship field involving two objects
                    //e.g Contact.Account.Name
                    if (data.fields[fieldsList[1]].value==null)
                    {
                        fieldValueMap.value=' ';
                        continue;
                    }
                    
                    if (this.fieldValueMapList[i].dateFormat === undefined && data.fields[fieldsList[1]].value
                        .fields[fieldsList[2]].displayValue) {
                        fieldValue = getSafeValue(
                            () => data.fields[fieldsList[1]].value
                            .fields[fieldsList[2]].displayValue,
                            null);
                    } else {
                        fieldValue = getSafeValue(
                            () => data.fields[fieldsList[1]].value
                            .fields[fieldsList[2]].value,
                            null);
                    }
                     
                } else if (fieldsList.length === 4) {
                    // check if it contains two relationship fields involving three objects
                    //e.g Contact.Account.CreatedBy.Name
                    if (this.fieldValueMapList[i].dateFormat === undefined && data.fields[fieldsList[1]].value
                        .fields[fieldsList[2]].value
                        .fields[fieldsList[3]].displayValue) {
                        fieldValue = getSafeValue(
                            () => data.fields[fieldsList[1]].value
                            .fields[fieldsList[2]].value
                            .fields[fieldsList[3]].displayValue,
                            null);
                    } else {
                        fieldValue = getSafeValue(
                            () => data.fields[fieldsList[1]].value
                            .fields[fieldsList[2]].value
                            .fields[fieldsList[3]].value,
                            null);
                    }
                } else if (fieldsList.length === 5) {
                    // check if it contains three relationship fields involving four objects
                    if (this.fieldValueMapList[i].dateFormat === undefined && data.fields[fieldsList[1]].value
                        .fields[fieldsList[2]].value
                        .fields[fieldsList[3]].value
                        .fields[fieldsList[4]].displayValue) {
                        fieldValue = getSafeValue(
                            () => data.fields[fieldsList[1]].value
                            .fields[fieldsList[2]].value
                            .fields[fieldsList[3]].value
                            .fields[fieldsList[4]].displayValue,
                            null);
                    } else {
                        fieldValue = getSafeValue(
                            () => data.fields[fieldsList[1]].value
                            .fields[fieldsList[2]].value
                            .fields[fieldsList[3]].value
                            .fields[fieldsList[4]].value,
                            null);
                    }
                }
                let regexDate = /^\d{4}-\d{2}-\d{2}$/;

                //alert(this.fieldValueMapList[i].dateFormat);
                //alert(typeof fieldValue);
                //alert(fieldValue);

                if (fieldsList[0] === data.apiName) {
                    if (typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
                        fieldValueMap.value = fieldValue + '';
                        //else if(fieldValue && fieldValue.match(regexDate))
                    }

                    //ABDS:e:Added for string
                    else if (fieldValue && this.fieldValueMapList[i].dateFormat !== undefined) {
                        await convertDate({
                                dateValue: fieldValue,
                                dateFormat: this.fieldValueMapList[i].dateFormat,
                                fieldValueChange: 'no'
                            })
                            .then(data => {
                                if (data) {
                                    var str = data;
                                    fieldValueMap.value = str;
                                }
                            })
                            .catch(error => {
                                showError(this, error);
                            });
                        //fieldValueMap.value = formatDate(fieldValue);
                    } //ABDS:s:Added for string 
                    else if (typeof fieldValue === 'string') {
                        console.log('>>fieldValue 3>>')
                        fieldValueMap.value = fieldValue + '';
                    } else if (fieldValue && fieldValue.split('\r\n').length > 1) {
                        fieldValueMap.value = fieldValue.split('\r\n').join('<br>');
                    } else if (fieldValue === null) {
                        // if fieldValue === null, reference field was queried and didn't contain any value.
                        fieldValueMap.value = null;
                    } else if (fieldValue) {
                        fieldValueMap.value = fieldValue;
                    }
                }
            }
            /** calling getTransationalData to get the data if reference field conntains field like User,
             *  Orginisation,Custom Settings,Custom Meta data and push the value to fieldValueMapList
             */

            this.getTransationalData();
            this.loadReferenceFieldsData();

            this.isLoadingPreview = false;
            console.log('Loading Done');
            if (this.isSaved == false && this.saveonload == 'true') {
                this.isSaved = true;
                this.handleSave();
            }
    
            console.log('handleSave');
            
        } else if (error) {
            showError(this, error);
        }
        
        // if (Array.isArray(this.contents) && this.contents.length) {
        //     console.log('Loading Done');
        //     if (this.isSaved == false && this.saveonload == 'true') {
        //         this.isSaved = true;
        //         this.handleSave();
        //     }   
        //     console.log('handleSave');
        // } else {
        //     console.log('Loading Not Done');
        // }
      
    };

    loadReferenceFieldsData() {
        let tempSection;
        debugger;
        for (let i in this.fieldValueMapList) {
            if (this.fieldValueMapList[i].key) {
                let sectionId = this.fieldValueMapList[i].key.split('-')[0];
                let tempSection = this.contents.find(ele => ele.id === sectionId);
                let mainContentSection = this.mainContent.find(ele => ele.id === sectionId);
                if (tempSection) {
                    if (this.fieldValueMapList[i].value != '') {
                        this.isLoadingPreview = false;
                        if (this.fieldValueMapList[i].isHidden)
                        {
                            this.fieldValueMapList[i].value='';  
                        }
                        // if this.fieldValueMapList[i].value === null, reference field was queried and didn't contain any value.
                        let valueToReplace = this.fieldValueMapList[i].value === null ? '' : this.fieldValueMapList[i].value;
                        tempSection.content = tempSection.content.split(this.fieldValueMapList[i].placeholder).join(valueToReplace);
                        if (!this.fieldValueMapList[i].isCustomJson) {
                            //add value entry in mainContent section field if value is not null/undefined/empty
                            let placeholderContent = this.fieldValueMapList[i].placeholder.replace(this.metadataRecord[START_IDENTIFIER.fieldApiName], '').replace(this.metadataRecord[END_IDENTIFIER.fieldApiName], '');
                            let fieldToUpdate = mainContentSection.fields.find(ele => ele.placeholderContent === placeholderContent);
                            fieldToUpdate.value = this.fieldValueMapList[i].value;
                        }
                    }
                }
            } else if (this.fieldValueMapList[i].placeholder && this.fieldValueMapList[i].value) {
                this.isLoadingPreview = false;
                // For text replacement at Template level using custom JSON
                for (let j in this.mainContent) {
                    this.contents[j].content = this.contents[j].content.split(this.fieldValueMapList[i].placeholder).join(this.fieldValueMapList[i].value);
                }
            }
        }
        // mark load complete
        this.loadComplete = true;
        this.isLoadingPreview = false;
        console.log('>>>contents>>>' + JSON.stringify(this.contents));

        // if (this.isSaved == false && this.saveonload == 'true') {
        //     this.isSaved = true;
        //     this.handleSave();
        // }

        // console.log('handleSave');
    }

    /**
     * Load refernce field names into this.refFields
     * Input: Name and phone fields for contact object are added from UI.
     * Output: this.refFields = ["Contact.Name","Contact.HomePhone"]
     */
    initializeRefFields() {
        this.refFields = [];
        this.fieldValueMapList = [];
        for (let i in this.contents) {
            for (let j in this.contents[i].fields) {
                let field = this.contents[i].fields[j];
                if (field.referenceField) {
                    /** checking and filtering only object reference field is added to the fieldValuemap and not any reference feild 
                     *  and not any reference field with global variables
                     * */

                    if (!field.referenceField.split('.')[0].includes('$')) {
                        
                        if (field.isHidden){
                            //for future use if required 
                        }
                        else{
                            this.refFields.push(field.referenceField);
                        }

                        let fieldKey = this.contents[i].id + '-' + this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];
                        this.fieldValueMapList.push({
                            key: fieldKey,
                            placeholder: this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName],
                            refField: field.referenceField,
                            dateFormat: field.dateFormat,
                            value: ''
                        });
                    }
                }
            }
            //for generating custom content
            if (Array.isArray(this.contents[i].customJSONObj) && this.contents[i].customJSONObj.length) {
                this.contents[i].customJSONObj.forEach(ele => this.fieldValueMapList.push({
                    key: ele.key,
                    placeholder: this.metadataRecord[START_IDENTIFIER.fieldApiName] + ele.placeholder + this.metadataRecord[END_IDENTIFIER.fieldApiName],
                    value: ele.value,
                    isCustomJson: true
                }));
            }
        }
        this.loadReferenceFieldsData();
        console.log('this.refFields==>'+this.refFields.length);
        console.log('this.refFields==>'+this.refFields);
        
        this.refFields = [...this.refFields];
        if(this.refFields.length==0)
        {   
            this.refFields.push(this.objectApiName+'.Id');
        }
        console.log('this.refFields1==>'+this.refFields.length);
    }

    renderedCallback() {
        if (Array.isArray(this.contents) && this.contents.length) {
            this.isLoading = false;
            console.log('renderedCallbackfalse');
        } else {
            this.isLoading = true;
            console.log('renderedCallbacktrue');
        }

    }

    createDocumentAndRelatedSections() {
        const fields = {};

        fields[VERSION_FIELD.fieldApiName] = 'V1';
        fields[TEMPLATEID_FIELD.fieldApiName] = this.formId;
        fields[STAGE_FIELD.fieldApiName] = 'Draft';
        if (!this.documentNameExtention.trim()) {
            showCustomToast(this, 'Error', 'Please Enter a Corporate Document Name Before Saving !', 'error');
            return;
        } else {
            fields[CORPORATE_DOCUMENT_NAME.fieldApiName] = (this.templateDocumentData.data.fields.Name.value + ' - ' + this.documentNameExtention).substring(0, 79);
        }


        if (this.recordId) {
            fields[RELATED_RECORD.fieldApiName] = this.recordId;
        }
        const recordInput = {
            apiName: CORPORATE_OBJECT.objectApiName,
            fields: fields
        };
        createRecord(recordInput)
            .then(corpDoc => {
                this.documentId = corpDoc.id;
                this.isCreateDocumentOpen = false;
                let sectionList = [];
                for (let i in this.contents) {
                    let sectionContent = {};
                    sectionContent[DOC_NAME_FIELD.fieldApiName] = this.contents[i].name;
                    sectionContent[ORDER_SEQUENCE_FIELD.fieldApiName] = this.contents[i].orderSequence;
                    sectionContent[CONTENT_TYPE.fieldApiName] = this.contents[i].contentType;
                    sectionContent[ENABLE_LANDSCAPE_LAYOUT.fieldApiName] = this.contents[i].isLandscapeLayout;
                    sectionContent[VISIBILITY.fieldApiName] = this.contents[i].visibility;
                    sectionContent[ALIGNMENT.fieldApiName] = this.contents[i].alignment;
                    sectionContent[SECTION_CONTENT_FIELD.fieldApiName] = this.contents[i].content;
                    sectionContent[CORPORATE_DOC_FIELD.fieldApiName] = this.documentId;
                    sectionContent[QUERY_JSON_FIELD.fieldApiName] = this.contents[i].queryJSON;
                    sectionList.push(sectionContent);
                }
                upsertDocContentList({
                        docContentList: sectionList
                    })
                    .then(resp => {
                        this.dispatchEvent(new CustomEvent("contentsave"));
                        if (this.saveonload !== 'true') {
                            showCustomToast(this, 'Success', 'Record created successfully!', 'success');
                        }
                        this.formId = undefined;
                        this.documentNameExtention = '';
                    }).catch(error => {
                        showError(this, error);
                    });
            })
            .catch(error => {
                showError(this, error);
            });
    }

    handleFieldValueChange(event) {
        if (event.currentTarget.dataset.type === 'Date') {
            convertDate({
                    dateValue: event.detail.value,
                    dateFormat: event.currentTarget.dataset.format,
                    fieldValueChange: 'yes'
                })
                .then(data => {
                    if (data) {
                        var str = data;
                        let tempContents = [...this.contents];
                        let tempMainContent = [...this.mainContent];
                        let section = tempContents.find(ele => ele.id === event.detail.sectionId);
                        let tempSection;
                        tempMainContent.forEach(function (item) {
                            if (item.id === event.detail.sectionId) {
                                tempSection = item.content;
                            }
                        });
                        let placeholder = this.metadataRecord[START_IDENTIFIER.fieldApiName] + event.detail.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];

                        let fieldKey = event.detail.sectionId + '-' + placeholder;
                        if (this.fieldValueMapList && this.fieldValueMapList.length) {
                            let fieldValueMap = this.fieldValueMapList.find(ele => ele.key === fieldKey);
                            if (fieldValueMap) {
                                fieldValueMap.value = str;
                            } else {
                                this.fieldValueMapList.push({
                                    key: fieldKey,
                                    placeholder: placeholder,
                                    value: str
                                });
                            }
                        } else {
                            this.fieldValueMapList.push({
                                key: fieldKey,
                                placeholder: placeholder,
                                value: str
                            });
                        }

                        let tempSectionContent;
                        let matchCount = 0;
                        for (let i in this.fieldValueMapList) {
                            if ((this.fieldValueMapList[i].key && this.fieldValueMapList[i].key.includes(event.detail.sectionId)) ||
                                (!this.fieldValueMapList[i].key && this.fieldValueMapList[i].isCustomJson)) {
                                // if this.fieldValueMapList[i].value === null, reference field was queried and didn't contain any value.
                                let valueToReplace = this.fieldValueMapList[i].value === null ? '' : this.fieldValueMapList[i].value;
                                if (++matchCount == 1)
                                    tempSectionContent = tempSection.split(this.fieldValueMapList[i].placeholder).join(valueToReplace);
                                else
                                    tempSectionContent = tempSectionContent.split(this.fieldValueMapList[i].placeholder).join(valueToReplace);
                            }
                        }
                        section.content = tempSectionContent;
                    }
                })
                .catch(error => {
                    showError(this, error);
                });
        } else {
            let tempContents = [...this.contents];
            let tempMainContent = [...this.mainContent];
            let section = tempContents.find(ele => ele.id === event.detail.sectionId);
            let tempSection;
            tempMainContent.forEach(function (item) {
                if (item.id === event.detail.sectionId) {
                    tempSection = item.content;
                }
            });
            let placeholder = this.metadataRecord[START_IDENTIFIER.fieldApiName] + event.detail.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];

            let fieldKey = event.detail.sectionId + '-' + placeholder;
            if (this.fieldValueMapList && this.fieldValueMapList.length) {
                let fieldValueMap = this.fieldValueMapList.find(ele => ele.key === fieldKey);
                if (fieldValueMap) {
                    fieldValueMap.value = event.detail.value;
                } else {
                    this.fieldValueMapList.push({
                        key: fieldKey,
                        placeholder: placeholder,
                        value: event.detail.value
                    });
                }
            } else {
                this.fieldValueMapList.push({
                    key: fieldKey,
                    placeholder: placeholder,
                    value: event.detail.value
                });
            }

            let tempSectionContent;
            let matchCount = 0;
            for (let i in this.fieldValueMapList) {
                if ((this.fieldValueMapList[i].key && this.fieldValueMapList[i].key.includes(event.detail.sectionId)) ||
                    (!this.fieldValueMapList[i].key && this.fieldValueMapList[i].isCustomJson)) {
                    // if this.fieldValueMapList[i].value === null, reference field was queried and didn't contain any value.
                    let valueToReplace = this.fieldValueMapList[i].value === null ? '' : this.fieldValueMapList[i].value;
                    if (++matchCount == 1)
                        tempSectionContent = tempSection.split(this.fieldValueMapList[i].placeholder).join(valueToReplace);
                    else
                        tempSectionContent = tempSectionContent.split(this.fieldValueMapList[i].placeholder).join(valueToReplace);
                }
            }
            section.content = tempSectionContent;
        }
    }

    //ABDS:s:e: Created this method so that we can call it from imparative and wired method
    async formContentPreview(response) {
        this.contents = [];
        this.response = response;
        console.log('formContentPreview.response');
        console.log(response);
        let data;
        if (this.isPreview) {
            data = response;
        } else {
            data = response.data;
        }
        let error = response.error;
        if (data) {
            this.contents = JSON.parse(JSON.stringify(data));
            this.mainContent = JSON.parse(JSON.stringify(this.contents));
            console.log('this.mainContent.conunt');
            console.log(this.mainContent.length);
            for (let i in this.mainContent) {
                console.log('i');
                console.log(i);

                if (this.recordId && this.mainContent[i].isRelatedRecords && this.mainContent[i].queryJSON) {
                    this.contents[i].content = this.contents[i].content.split(TABLE_PLACEHOLDER).join(LOADING_TABLE_CONTENTS);
                    let queryJSONObj = JSON.parse(this.mainContent[i].queryJSON);
                    console.log('before.invokeGetFieldLabelList');
                    this.fieldLabelList = await this.invokeGetFieldLabelList(queryJSONObj.objectName, queryJSONObj.fields);
                    console.log('after.invokeGetFieldLabelList');
                    let tableMarkup = await this.getTableMarkup(this.recordId, this.mainContent[i].queryJSON, queryJSONObj.fields);
                    //alert(tableMarkup);
                    //alert(this.contents[i].content.split(LOADING_TABLE_CONTENTS));
                    if (tableMarkup) {
                        this.contents[i].content = this.contents[i].content.split(LOADING_TABLE_CONTENTS).join(tableMarkup);
                    } else {
                        this.contents[i].content = '';
                    }
                }

                if (this.mainContent[i].isCustomContent && this.mainContent[i].queryJSON) {
                    let queryJSONObj = JSON.parse(this.mainContent[i].queryJSON);
                    console.log('isCustomContent.queryJSONObj==>'+queryJSONObj);
                    if (queryJSONObj.isCustomJson === false) {
                        this.contents[i].content = this.contents[i].content.split(CUSTOM_CONTENT_PLACEHOLDER).join(LOADING_CUSTOM_CONTENTS);
                        let customMarkup = await this.invokeCustomMarkup(this.recordId, queryJSONObj.implementationClass, queryJSONObj.customInput);
                        this.contents[i].content = this.contents[i].content.split(LOADING_CUSTOM_CONTENTS).join(customMarkup);
                    } else if (queryJSONObj.isCustomJson === true) {
                        let customJSONObj = JSON.parse(await this.invokeCustomJSON(this.recordId, queryJSONObj.implementationClass, queryJSONObj.customInput));
                        console.log('isCustomContent.customJSONObj==>'+customJSONObj);
                        if (queryJSONObj.jsonAvailability === SECTION_LEVEL) {
                            console.log('SECTION_LEVEL==>');
                            customJSONObj = customJSONObj.map(ele => Object.assign({}, {
                                key: this.contents[i].id + '-' + ele.placeholder
                            }, ele));
                        }
                        this.contents[i].customJSONObj = customJSONObj;
                    }
                }

                if (this.mainContent[i].fields && this.mainContent[i].fields.length) {
                    //this.displayFieldSet = true;
                }
            }
            console.log('before.initializeRefFields');
            this.initializeRefFields();
            console.log('after.initializeRefFields');
            this.error = undefined;
        } else if (error) {
            this.error = error;
            showError(this, error);
        }
    }

    // Hide Field  Set
    get displayFieldSetCall() {
        let isDisplayfieldSet = false;
        if (this.mainContent && this.mainContent.length > 0) {
            this.mainContent.forEach(obj => {
                obj.fields.forEach(obj1 => {
                    if (!obj1.value) {
                        isDisplayfieldSet = true;
                    }
                });
            });
        }
        return isDisplayfieldSet;
    }

    @wire(getFormContentList, {
        formId: '$formId'
    })
    formContent(response) {

        //ABDS:s:Added if and 
        //commented else part just added one line of code
        if (this.isPreview) {
            getFormContentListPreview({
                    formId: this.formId
                })
                .then((result) => {
                    this.formContentPreview(result);
                })
                .catch((error) => {
                    alert(error);
                    this.error = error;
                    this.contents = undefined;
                });
        } else {
            this.formContentPreview(response);
            // // this.contents =[];
            // // this.response = response;
            // // console.log('response');
            // // console.log(response);
            // // let data = response.data;
            // // let error = response.error;
            // // if (data) {
            // //     this.contents = JSON.parse(JSON.stringify(data));
            // //     this.mainContent = JSON.parse(JSON.stringify(this.contents));
            // //     for(let i in this.mainContent) {
            // //         if(this.recordId && this.mainContent[i].isRelatedRecords && this.mainContent[i].queryJSON) {
            // //             this.contents[i].content = this.contents[i].content.split(TABLE_PLACEHOLDER).join(LOADING_TABLE_CONTENTS);
            // //             let queryJSONObj = JSON.parse(this.mainContent[i].queryJSON);
            // //             this.fieldLabelList = await this.invokeGetFieldLabelList(queryJSONObj.objectName, queryJSONObj.fields);
            // //             let tableMarkup = await this.getTableMarkup(this.recordId, this.mainContent[i].queryJSON, queryJSONObj.fields);
            // //             this.contents[i].content = this.contents[i].content.split(LOADING_TABLE_CONTENTS).join(tableMarkup);
            // //         }
            // //         if(this.mainContent[i].isCustomContent && this.mainContent[i].queryJSON) {
            // //             let queryJSONObj = JSON.parse(this.mainContent[i].queryJSON);
            // //             if(queryJSONObj.isCustomJson === false) {
            // //                 this.contents[i].content = this.contents[i].content.split(CUSTOM_CONTENT_PLACEHOLDER).join(LOADING_CUSTOM_CONTENTS);
            // //                 let customMarkup = await this.invokeCustomMarkup(this.recordId, queryJSONObj.implementationClass, queryJSONObj.customInput);
            // //                 this.contents[i].content = this.contents[i].content.split(LOADING_CUSTOM_CONTENTS).join(customMarkup);
            // //             } else if (queryJSONObj.isCustomJson === true) {
            // //                 let customJSONObj = JSON.parse(await this.invokeCustomJSON(this.recordId, queryJSONObj.implementationClass, queryJSONObj.customInput));
            // //                 if(queryJSONObj.jsonAvailability === SECTION_LEVEL) {
            // //                     customJSONObj = customJSONObj.map(ele => Object.assign({}, {key: this.contents[i].id + '-' + ele.placeholder}, ele));
            // //                 }
            // //                 this.contents[i].customJSONObj = customJSONObj;
            // //             }
            // //         }
            // //         if(this.mainContent[i].fields && this.mainContent[i].fields.length) {
            // //             this.displayFieldSet = true;
            // //         }
            // //     }
            // //     this.initializeRefFields();
            // //     this.error = undefined;
            // // } else if (error) {
            // //     alert('In Error formContent')
            // //     this.error = error;
            // //     showError(this, error);
            // // }
        }

    }

    async invokeGetFieldLabelList(objectName, fieldList) {

        let strFieldList = '';
        console.log('in.before.invokeGetFieldLabelList.fieldList==>' + typeof fieldList);
        console.log('in.before.invokeGetFieldLabelList.fieldList==>' + JSON.stringify(fieldList));
        console.log('in.before.invokeGetFieldLabelList.fieldList==>' + ((typeof fieldList) === 'object'));
        if ((typeof fieldList) === 'object') {
            strFieldList = JSON.stringify(fieldList).replace("[", "").replace("]", "").replaceAll('"', '');
            console.log('typeof strFieldList==>' + typeof strFieldList);
            fieldList = strFieldList;
            console.log('typeof fieldList==>' + typeof fieldList);
        }

        console.log('in.before.invokeGetFieldLabelList.fieldList==>' + fieldList);
        let resp = await getFieldLabelList({
            objectName,
            fieldList
        });
        console.log('in.after.invokeGetFieldLabelList' + resp);
        if (resp) {
            return resp;
        }
    }

    async invokeCustomMarkup(recordId, implementationClass, customInput) {
        let resp = await getCustomMarkup({
            recordId,
            implementationClass,
            customInput
        });
        if (resp) {
            return resp;
        }
    }

    async invokeCustomJSON(recordId, implementationClass, customInput) {
        let resp = await getCustomJSON({
            recordId,
            implementationClass,
            customInput
        });
        if (resp) {
            return resp;
        }
    }

    async getTableMarkup(recordId, queryJSON, fieldList) {

        console.log('getTableMarkup typeof fieldList==>' + typeof fieldList);
        console.log('fieldList==>' + fieldList);
        if ((typeof fieldList) === 'object') {
            let strFieldList = JSON.stringify(fieldList).replace("[", "").replace("]", "").replaceAll('"', '');
            console.log('typeof strFieldList==>' + typeof strFieldList);
            fieldList = strFieldList;
            console.log('typeof fieldList==>' + typeof fieldList);
            console.log(' fieldList==>' + fieldList);
        }

        let relationshipInfoList = [];
        let recordList = [];
        let fieldLabelList = [];


        try {
            console.log('before.getRecordList==>');
            recordList = await getRecordList({
                recordId: recordId,
                queryJSON: queryJSON
            });
            console.log('after.getRecordList==>');
        } catch (error) {
            alert(reduceError(error, 'getTableMarkup'));
            return 'Error generating table.';
        }
        let relationshipField = fieldList.split(',').find(ele => ele.split('.').length === 2);
        if (relationshipField) {
            // if relationshipField exists then create an array where each object contains
            // objectPrefix, relationshipName and inputFieldApiNames
            for (let field of fieldList.split(',')) {
                field = field.trim();
                if (field.split('.').length === 2) {
                    let element = recordList.find(ele => retrievePropertyIgnoreCase(field.split('.')[0], ele));
                    if (element) {
                        let relationshipName = retrievePropertyIgnoreCase(field.split('.')[0], element);
                        let relationshipInfo = relationshipInfoList.find(ele => ele.relationshipName === relationshipName);
                        if (relationshipInfo) {
                            relationshipInfo.inputFieldApiNames.push(field.split('.')[1]);
                        } else {
                            relationshipInfo = {
                                objectPrefix: element[relationshipName].Id.substring(0, 3),
                                relationshipName: field.split('.')[0],
                                inputFieldApiNames: [field.split('.')[1]]
                            };
                            relationshipInfoList = [...relationshipInfoList, relationshipInfo];
                        }
                    }
                }
            }
            //retrieve other relationship info like objectName and field labels
            relationshipInfoList = await getCompletedRelationshipInfoList({
                relationshipInfoList: relationshipInfoList
            });
            // polulate fieldLabelList with retrieved relationship info
            for (let field of fieldList.split(',')) {
                field = field.trim();
                // if the field is a relationship field
                if (field.split('.').length === 2) {
                    let element = relationshipInfoList.find(ele => ele.relationshipName.toLowerCase() === field.split('.')[0].toLowerCase());
                    if (element) {
                        let fieldLabel = element.fieldsList.find(ele => ele.apiName.toLowerCase() === field.split('.')[1].toLowerCase()).label;
                        //To do in apex side
                        let labelField = field.replace('.', ' ');
                        labelField = (labelField.includes('__r') ? labelField.replace('__r', '') : labelField);
                        labelField = labelField.includes('__c') ? labelField.replace('__c', '') : labelField
                        fieldLabelList = [...fieldLabelList, {
                            jsonPath: field,
                            // label: fieldLabel
                            label: labelField
                        }];
                    }
                } else if (field && field.split('.').length === 1) {
                    // else if the field is not a relationship field
                    let element = this.fieldLabelList.find(ele => ele.apiName.toLowerCase() === field.toLowerCase());
                    if (element)
                        fieldLabelList = [...fieldLabelList, element];
                }
            }
        } else {
            // if relationshipField does't exists
            fieldLabelList = [...this.fieldLabelList];

        }

        // prepare table markup for the records
        if (recordList && recordList.length) {
            let queryJSONObj = JSON.parse(queryJSON);
            let fieldNamesList = Object.keys(recordList[0]).filter(ele => ele !== 'Id');
            let noOfRows = recordList.length;
            let noOfCols = queryJSONObj.fields.split(',').length;
            let tableMarkup = '<table style="' + (queryJSONObj.tableStyle ? queryJSONObj.tableStyle : '') + '">';
            if (queryJSONObj.enableTableHeader) {
                tableMarkup += '<tr style="' + (queryJSONObj.tableHeaderRowStyle ? queryJSONObj.tableHeaderRowStyle : '') + '">';
                for (let j = 0; j < noOfCols; j++) {
                    if (fieldLabelList[j]) {
                        tableMarkup += '<th style="' + (queryJSONObj.tableHeaderStyle ? queryJSONObj.tableHeaderStyle : '') + '">' +
                            fieldLabelList[j].label + '</th>';
                    }
                }
                tableMarkup += '</tr>';
            }
            for (let i = 0; i < noOfRows; i++) {
                if (queryJSONObj.enableAlternateRowStyle && (i % 2 == 1)) {
                    tableMarkup += '<tr style="' + (queryJSONObj.row2Style ? queryJSONObj.row2Style : '') + '">';
                } else {
                    tableMarkup += '<tr style="' + (queryJSONObj.row1Style ? queryJSONObj.row1Style : '') + '">';
                }

                for (let j = 0; j < noOfCols; j++) {
                    if (fieldLabelList[j]) {
                        if (fieldLabelList[j].jsonPath) {
                            let relationshipName = retrievePropertyIgnoreCase(fieldLabelList[j].jsonPath.split('.')[0], recordList[i]);
                            if (relationshipName) {
                                let fieldApiName = retrievePropertyIgnoreCase(fieldLabelList[j].jsonPath.split('.')[1], recordList[i][relationshipName]);
                                tableMarkup += '<td style="' + (queryJSONObj.cellStyle ? queryJSONObj.cellStyle : '') + '">' +
                                    (recordList[i][relationshipName][fieldApiName] ? recordList[i][relationshipName][fieldApiName] : '') +
                                    '</td>';
                            } else {
                                tableMarkup += '<td style="' + (queryJSONObj.cellStyle ? queryJSONObj.cellStyle : '') + '"></td>';
                            }
                        } else if (fieldLabelList[j].apiName) {
                            tableMarkup += '<td style="' + (queryJSONObj.cellStyle ? queryJSONObj.cellStyle : '') + '">' +
                                (recordList[i][fieldLabelList[j].apiName] ? recordList[i][fieldLabelList[j].apiName] : '') +
                                '</td>';
                        }
                    }
                }
                tableMarkup += '</tr>';
            }
            tableMarkup += '</table>';
            return tableMarkup;
        }
    }

    //Method to  get transcational datas of user, Organization, custom settings and custom metadata etc. 
    getTransationalData() {
        for (let i in this.contents) {
            for (let j in this.contents[i].fields) {
                let field = this.contents[i].fields[j];
                if (field.referenceField) {
                    let referenceFieldList = field.referenceField.split('.');
                    // Getting reference field value for User
                    if (referenceFieldList[0] === '$User') {
                        let userFieldValue = referenceFieldList[1];
                        if (userFieldValue) {
                            getUserInfo({
                                    referenceField: userFieldValue
                                })
                                .then(data => {
                                    if (data) {
                                        let fieldValue = data;
                                        let fieldKey = this.contents[i].id + '-' + this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];
                                        this.fieldValueMapList.push({
                                            key: fieldKey,
                                            placeholder: this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName],
                                            refField: field.referenceField,
                                            value: fieldValue
                                        });
                                        this.loadReferenceFieldsData();
                                    }
                                })
                                .catch(error => {
                                    showError(this, error);
                                });
                        }
                        // Getting reference field value for Organization
                    } else if (referenceFieldList[0] === '$Organization') {
                        let userFieldValue = referenceFieldList[1];
                        if (userFieldValue) {
                            getOrgInfo({
                                    referenceField: userFieldValue
                                })
                                .then(data => {
                                    if (data) {
                                        let fieldValue = data;
                                        let fieldKey = this.contents[i].id + '-' + this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];
                                        this.fieldValueMapList.push({
                                            key: fieldKey,
                                            placeholder: this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName],
                                            refField: field.referenceField,
                                            value: fieldValue
                                        });
                                        this.loadReferenceFieldsData();
                                    }
                                })
                                .catch(error => {
                                    showError(this, error);
                                });
                        }
                        // Getting reference field value for Custom settings
                    } else if (referenceFieldList[0] === '$Settings') {
                        let customSettingObj = referenceFieldList[1];
                        let userFieldValue = referenceFieldList[2];
                        if (customSettingObj && userFieldValue) {
                            getCustomSettings({
                                    customSettingName: customSettingObj,
                                    referenceField: userFieldValue
                                })
                                .then(data => {
                                    if (data) {
                                        let fieldValue = data;
                                        let fieldKey = this.contents[i].id + '-' + this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];
                                        this.fieldValueMapList.push({
                                            key: fieldKey,
                                            placeholder: this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName],
                                            refField: field.referenceField,
                                            value: fieldValue
                                        });
                                        this.loadReferenceFieldsData();
                                    }
                                })
                                .catch(error => {
                                    showError(this, error);
                                });
                        }
                        // Getting reference field value for Custom MetaData
                    } else if (referenceFieldList[0].includes("$Metadata")) {
                        let customMetadataObj = referenceFieldList[1];
                        let labelName = referenceFieldList[2];
                        let userFieldValue = referenceFieldList[3];
                        if (customMetadataObj && labelName && userFieldValue) {
                            getCustomMetaData({
                                    customMetaDataObj: customMetadataObj,
                                    label: labelName,
                                    referenceField: userFieldValue
                                })
                                .then(data => {
                                    if (data) {
                                        let fieldValue = data;
                                        let fieldKey = this.contents[i].id + '-' + this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];
                                        this.fieldValueMapList.push({
                                            key: fieldKey,
                                            placeholder: this.metadataRecord[START_IDENTIFIER.fieldApiName] + field.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName],
                                            refField: field.referenceField,
                                            value: fieldValue
                                        });
                                        this.loadReferenceFieldsData();
                                    }
                                })
                                .catch(error => {
                                    showError(this, error);
                                });
                        }
                    }
                }
            }
        }
    }

    validateFields() {
        let isValid = true;
        this.template.querySelectorAll('[class="datatypecell"]').forEach((element, index) => {
            if (isValid) {
                isValid = element.validateFields();
            }
        });
        return isValid;
    }
}