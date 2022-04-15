import {
    LightningElement,
    track,
    wire,
    api
} from 'lwc';
import {
    NavigationMixin
} from 'lightning/navigation';
import {
    CurrentPageReference
} from 'lightning/navigation';
import {
    showCustomToast,
    showError
} from 'c/utils';
import {
    getPicklistValues,
    getObjectInfo
} from 'lightning/uiObjectInfoApi';
import {
    createRecord,
    updateRecord
} from 'lightning/uiRecordApi';
//SSR:s-Get Related fields
import getRelatedFields from '@salesforce/apex/TemplateController.getRelatedFields';
import getRelatedLookUpObjectFields from '@salesforce/apex/TemplateController.getRelatedLookUpObjectFields';
import getRelatedLookUpObjectFields2 from '@salesforce/apex/TemplateController.getRelatedLookUpObjectFields2';
//SSR:e-Get Related fields
//SKP:s: Get relationshipName based on object and populate ParentFieldAPI 
import getReferenceFieldAPIName from '@salesforce/apex/TemplateController.getReferenceFieldAPIName';
import getRealtionshipName from '@salesforce/apex/TemplateController.getRealtionshipName';
//SKP:e: Get relationshipName based on object and populate ParentFieldAPI 
//ABDS:s:Get Object record Type and associted record type
import getObjects from '@salesforce/apex/TemplateController.getObjects';
import getObjectRecordType from '@salesforce/apex/TemplateController.getObjectRecordType';
//import getPageLayout from '@salesforce/apex/TemplateController.getPageLayout';
import getRecordObjectName from '@salesforce/apex/TemplateController.getRecordObjectName';
//ABDS:e:Get Object record Type and associted record type

/** Apex to fetch related records. */
import {
    refreshApex
} from '@salesforce/apex';


import deleteContent from '@salesforce/apex/TemplateController.deleteContent';
import upsertSectionAndFields from '@salesforce/apex/TemplateController.upsertSectionAndFields';
import getTemplateData from '@salesforce/apex/TemplateController.getTemplateData';
import isVFPageAvailable from '@salesforce/apex/TemplateController.isVFPageAvailable';
import getOrgInfo from '@salesforce/apex/TransationalDataController.getOrgInfo';
import getFieldNameForRefField from '@salesforce/apex/LookupSearchController.getFieldNameForRefField';
/**  Apex to fetch Document Content section On selection Of SerachLookup Field records. */
import getDocumentContentSectionWrapper from "@salesforce/apex/LookupController.getDocumentContentSectionWrapper";
//Dynamic identifier from custom metadata
import fetchMetadataIdentifiers from '@salesforce/apex/TemplateIdentifierClass.fetchMetadataIdentifierRecs';
//Date Formats from custom metadata
import fetchDateFormats from '@salesforce/apex/TemplateIdentifierClass.fetchDateFormats';
import getFieldsOfChildObject from '@salesforce/apex/LookupSearchController.findRecords';
/**  Apex to fetch Document Content section On selection Of SerachLookup Field records. */
//import createDefaultTemplateUsingMetaData from "@salesforce/apex/TemplateController.createDefaultTemplateUsingMetaData";
import createDefaultTemplateUsingToolingAPI from "@salesforce/apex/TemplateController.createDefaultTemplateUsingToolingAPI";
import fetchFieldInfo from "@salesforce/apex/TemplateController.fetchFieldInfo";

/** Document_Template__c Schema. */
import DOCUMENT_TEMPLATE from '@salesforce/schema/Document_Template__c';
import TEMPLATE_ID from '@salesforce/schema/Document_Template__c.Id';
import TEMPLATE_NAME from '@salesforce/schema/Document_Template__c.Name';
import TEMPLATE_DEPARTMENT from '@salesforce/schema/Document_Template__c.Department__c';
import TEMPLATE_PAGE_SIZE from '@salesforce/schema/Document_Template__c.Page_Size__c';
import TEMPLATE_BU from '@salesforce/schema/Document_Template__c.Business_Unit__c';
import TEMPLATE_TYPE from '@salesforce/schema/Document_Template__c.Template_Type__c';
import TEMPLATE_VERSION from '@salesforce/schema/Document_Template__c.Template_Version__c';
import TEMPLATE_DESCRIPTION from '@salesforce/schema/Document_Template__c.Description__c';
import TEMPLATE_IS_ACTIVE from '@salesforce/schema/Document_Template__c.Is_Active__c';
import TEMPLATE_IS_DEFAULT from '@salesforce/schema/Document_Template__c.Is_Default__c';
import TEMPLATE_ALLOW_ATTACH_AS_PDF from '@salesforce/schema/Document_Template__c.Allow_Attach_As_PDF__c';
import TEMPLATE_ALLOW_SEND_AS_EMAIL_ATTACHMENT from '@salesforce/schema/Document_Template__c.Allow_Send_As_Email_Attachment__c';
import TEMPLATE_ALLOW_ESIGN from '@salesforce/schema/Document_Template__c.Allow_Esign__c';
import TEMPLATE_ADDITIONAL_INFO from '@salesforce/schema/Document_Template__c.Additional_Info__c';
import TEMPLATE_PARENT_OBJ_NAME from '@salesforce/schema/Document_Template__c.Parent_Object_Name__c';
import TEMPLATE_RECORD_TYPE from '@salesforce/schema/Document_Template__c.Record_Type__c'; //SKP:to save Record_Type__c in Document_Template__c
import PARENT_TEMPLATE_ID from '@salesforce/schema/Document_Template__c.Parent_Template__c'; //ABD:to save Parent_Template__c in Document_Template__c
import IS_READONLY from '@salesforce/schema/Document_Template__c.Is_ReadOnly__c'; //ABD:to get readonly property

/** Document_Content__c Schema. */
import DOCUMENT_CONTENT from '@salesforce/schema/Document_Content__c';
import CONTENT_TYPE from '@salesforce/schema/Document_Content__c.Content_Type__c';
import VISIBILITY from '@salesforce/schema/Document_Content__c.Visibility__c';
import ALIGNMENT from '@salesforce/schema/Document_Content__c.Alignment__c';
import FIELD_TYPE from '@salesforce/schema/Document_Content__c.Field_Type__c';
import ORDER_SEQUENCE from '@salesforce/schema/Document_Content__c.Order_Sequence__c';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';
import DATE_FORMAT from '@salesforce/schema/Document_Content__c.Date_Format__c';

/**App Setting Schema */
import START_IDENTIFIER from '@salesforce/schema/App_Settings__c.Start_Identifier__c';
import END_IDENTIFIER from '@salesforce/schema/App_Settings__c.End_Identifier__c';


/** Constants */
const BODY = 'Body';
const PAGE_BREAK = 'Page Break';
const BLANK_PAGE = 'Blank Page';
const HEADER = 'Header';
const FOOTER = 'Footer';
const RELATED_RECORDS = 'Related Records';
const CUSTOM_CONTENT = 'Custom Content';
const CUSTOM_CONTENT_PLACEHOLDER = '[CUSTOM_CONTENT_PLACEHOLDER]';
const HTML = 'HTML';
const JSON_STR = 'JSON';
const TEMPLATE_LEVEL = 'Template Level';
const SECTION_LEVEL = 'Section Level';

/**
 * Component to create/edit template, sections and fields.
 */
export default class TemplateEditor extends NavigationMixin(LightningElement) {
    //ABDS:s:For record Id of target object
    @track recordIdData;
    @track recordIdObjectName;
    @api isRecordEdit = false;
    @api isRecordClone = false;
    @api templateId;
    @api parentTemplateId = '';
    @api versionNumber = '';
    isdisabled = true

    @api templateName; //SKP: to store templateName passed on cloning
    @api isCloneNewVersion; //SKP: to indicate cloned template is a new version or a new document template

    @track dateFormats = [];
    @track objectName;
    @track fetchChildObjects;
    @track previewShow = false;
    @track isRemoveSectionOpen = false;
    @track isRemoveFieldOpen = false;
    @track isConfirmCloseOpen = false;
    @track templateData = {};
    @track isLoading = false;
    @track allowMultipleSections = false;
    @track activeSectionName = '';
    @track rtfErrorMessage;
    @track showTableStyle = false;
    @track showSectionCopyLookup = false;
    @track documentContentRecordName;
    @track documentContentRecordId;
    @track SectionFromDataBase = {};
    @track isAdvanceEditorPageAvailable = false;
    @track organizationId;
    @track metadataRecord;
    @track parentFieldAPIOptions;
    @track isShowSection = false;
    @track showSectionClass = 'utility:toggle_panel_left';
    @track showSectionCopyLookuptop = false;
    //SSR:s For Relation Fields
    //@track objectOptions = [];
    @track isDuplicateSequenceOrder = false;
    @track FDDfieldOptions = [];
    @track FDDfieldOptions2 = [];
    @track FDDfieldOptions3 = [];
    @track selRefFields = [];
    @track isSelectedObject = false;
    @track isSelectedLookupObject = false;
    @track isSelectedLookupField = false;
    @track isLoading = false;
    selectedLookupField;
    selectedLookupField2;
    selectedLookupField3;
    @track queryField1;
    @track queryField2;
    @track queryField3;
    @track showQuery;
    @track showFields;

    @track CurrentFieldKey;
    @track CurrentFieldType;
    @track childObjectFields;
    @track isDefaultLookupField = true;
    //SSR:e For Relation Fields
    @track isSectionSaved = false;
    @track savedObjectName = '';
    @track savedRT = '';
    //ABDS:s:Added for parent field selection 
    @track isParentFieldSelectionOpen = false;
    @track disabledObjNTem = false
    //ABDS:e:Added for parent field selection
    disableDefault = true; //HS:Added to disable isDefault
    refFields;
    stringifiedInitialTemplateData;
    iconName;
    iconTitle;
    operation;
    newTemplateId = '';
    templateRecordTypeId;
    contentRecordTypeId;
    templateTypeOptions;
    templateDepartmentOptions;
    templateBUOptions;
    templatePSOptions;
    contentTypeOptions;
    fieldTypeOptions;
    visibilityOptions
    alignmentOptions;
    customTypeOptions = [{
        label: HTML,
        value: HTML
    },
    {
        label: JSON_STR,
        value: JSON_STR
    }
    ];
    jsonAvailabilityOptions = [{
        label: SECTION_LEVEL,
        value: SECTION_LEVEL
    },
    {
        label: TEMPLATE_LEVEL,
        value: TEMPLATE_LEVEL
    }
    ];
    sectionToRemove = {};
    fieldToRemove = {};
    response;
    responseForPreview;
    error;
    additionalInfoJSON = {};
    orderByOptions = [{
        label: 'ASC',
        value: 'ASC'
    },
    {
        label: 'DESC',
        value: 'DESC'
    }
    ];
    formats = ['font', 'size', 'bold', 'italic', 'underline',
        'strike', 'list', 'indent', 'align', 'link',
        'image', 'clean', 'table', 'header', 'color',
        'background', 'code', 'code-block', 'script',
        'blockquote', 'direction'
    ];


    //ABDS:s:var relate to objects
    @track selectedObject = '';
    //@track selectedRT = '';

    @track rtOptions = [];

    //SSR
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            if (currentPageReference && currentPageReference.state) {
                if (currentPageReference.state.c__isShowSection) {
                    if (currentPageReference.state.c__isShowSection == 'true' || currentPageReference.state.c__isShowSection == true) {
                        this.isShowSection = true;
                    } else {
                        this.isShowSection = false;
                    }
                }
                if (currentPageReference.state.c__showSectionClass) {
                    this.showSectionClass = currentPageReference.state.c__showSectionClass;
                }
            }
        }
    }

    handleObjectChange(pobjectName) {
        this.selectedObject = pobjectName;
        //console.log('handleObjectChange.selected Object', this.selectedObject);

        this.rtOptions = [];
        //this.pgOptions = [];
        this.isLoading = true;

        getObjectRecordType({
            selectedObject: this.selectedObject

        }).then((response) => {
            this.isLoading = false;

            if (response && response.length > 0) {

                let options = [];
                for (var key in response) {
                    options.push({
                        label: response[key],
                        value: response[key]
                    });
                }
                this.rtOptions = options;

                //SKP:s:to select default record type as Master
                if (this.rtOptions.length == 1) {
                    //this.selectedRT = this.rtOptions[0].value;
                    this.templateData.recordType = this.rtOptions[0].value;
                }
                //SKP:e:to select default record type as Master    

            }

        }).catch((error) => {
            this.isLoading = false;
        });

    }

    handlerecordTypeChange(event) {

        //this.selectedRT = event.detail.value;
        this.templateData.recordType = event.detail.value; //SKP:to save Record_Type__c in Document_Template__c
    }

    handlerecordIdData(event) {
        this.recordIdData = event.target.value;
    }

    openPreviewModal(event) {

        if (!this.recordIdData) {
            showCustomToast(this, 'Error', 'Please enter Record Id to preview.', 'error');
            return;
        }
        if (!this.isRecordEdit) {
            showCustomToast(this, 'Warning', 'Please create template record and then perform Live Preview action.', 'Warning');
            return;
        }
        //console.log('data');
        getRecordObjectName({
            recordId: this.recordIdData
        }).then(data => {

            console.log(data);
            this.recordIdObjectName = data;
            this.template.querySelector('[class="form-contents"]').handleCreateNew(event, this.templateId);

        }).catch(error => {
            console.log('error ');
            showCustomToast(this, 'Error', error.body.message, 'error');
            return;

        });

    }
    //SSR:s---getting field names

    handleObjectChange2(objName) {
        this.showFields = '';
        this.selectedObject = objName;

        //console.log('handleObjectChange2.selected Object', this.selectedObject);

        if (this.selectedObject) {

            this.isSelectedObject = true;
            this.isSelectedLookupObject = false;
            this.isSelectedLookupField = false;
        }
        this.FDDfieldOptions = [];
        this.FDDfieldOptions2 = [];
        this.FDDfieldOptions3 = [];
        //this.pgOptions = [];
        this.isLoading = true;


        getRelatedFields({
            selectedObject: this.selectedObject
        }).then((response) => {
            this.isLoading = false;

            if (response && response.length > 0) {

                let options = [];
                for (var key in response) {
                    options.push({
                        label: response[key],
                        value: response[key]
                    });
                }
                this.FDDfieldOptions = options;
            }

        }).catch((error) => {
            this.isLoading = false;
            // alert('In Error' + error);
            console.log(error);
        });
    }

    handleFieldChange(event) {
        this.showFields = '';
        this.queryField3 = '';
        this.queryField2 = '';
        this.queryField1 = '';
        this.selectedLookupField = event.detail.value;
        console.log('selectedLookupField > ' + this.selectedLookupField);
        console.log('selectedObject > ' + this.selectedObject);
        if (this.selectedLookupField.includes(">")) {

            this.selectedLookupField = this.selectedLookupField.replace(" > ", "")
            if (this.selectedLookupField) {
                this.isSelectedLookupObject = true;
                this.isSelectedObject = true;
                this.isSelectedLookupField = false;
                let selectedField = this.selectedLookupField;
                this.queryField1 = selectedField;
                /*if(selectedField.includes("__c")){
                    selectedField = selectedField.replace("__c","__r.");
                    this.queryField1 = selectedField;
                }else if(selectedField.slice(-2) == 'Id'){
                    selectedField = selectedField.replace("Id",".");
                    this.queryField1 = selectedField;
                }*/
            }
            this.FDDfieldOptions2 = [];
            this.FDDfieldOptions3 = [];
            //this.pgOptions = [];
            this.isLoading = true;

            getRelatedLookUpObjectFields({
                selectedLookupField: this.selectedLookupField,
                selectedObject: this.selectedObject

            }).then((response) => {
                this.isLoading = false;
                console.log(response);

                if (response && response.length > 0) {

                    let options = [];
                    for (var key in response) {
                        options.push({
                            label: response[key],
                            value: response[key]
                        });
                    }
                    this.FDDfieldOptions2 = options;
                }

            }).catch((error) => {
                this.isLoading = false;
                //alert('In Error' + error);
                console.log(error);
            });
        } else {
            this.isSelectedLookupField = false;
            this.isSelectedLookupObject = false;
            this.queryField1 = this.selectedLookupField;

        }

        if (this.CurrentFieldType == "RelatedRecord") {
            this.showFields = this.queryField1;
        } else {
            this.showFields = this.templateData.parentObjectName + '.' + this.queryField1;
        }



    }

    handleFieldChange2(event) {
        try {
            this.showFields = '';
            this.queryField3 = '';
            this.queryField2 = '';
            this.selectedLookupField2 = event.detail.value;
            console.log('selectedLookupField2 > ' + this.selectedLookupField2);
            console.log('selectedObject > ' + this.selectedObject);
            if (this.selectedLookupField2.includes(">")) {

                this.selectedLookupField2 = this.selectedLookupField2.replace(" > ", "")
                if (this.selectedLookupField2) {
                    this.isSelectedLookupField = true;
                    this.isSelectedObject = true;
                    //this.isSelectedObject = true;
                    let selectedField = this.selectedLookupField2;
                    if (this.selectedLookupField.includes('__c')) {
                        this.queryField2 = this.selectedLookupField.replace("__c", "__r.") + selectedField;
                    } else if (this.selectedLookupField.slice(-2) == 'Id') {
                        this.queryField2 = this.selectedLookupField.replace("Id", ".") + selectedField;
                    }
                    /*if(selectedField.includes("__c")){
                        selectedField = selectedField.replace("__c","__r.");
                        this.queryField2 = this.queryField1 + selectedField;
                    }else if(selectedField.slice(-2) == 'Id'){
                        selectedField = selectedField.replace("Id",".");
                        this.queryField2 = this.queryField1 + selectedField;
                    }*/
                }
                this.FDDfieldOptions3 = [];

                //this.pgOptions = [];
                this.isLoading = true;

                getRelatedLookUpObjectFields2({
                    selectedLookupField2: this.selectedLookupField2,
                    selectedLookupField: this.selectedLookupField,
                    selectedObject: this.selectedObject

                }).then((response) => {
                    this.isLoading = false;
                    console.log(response);

                    if (response && response.length > 0) {

                        let options = [];
                        for (var key in response) {
                            options.push({
                                label: response[key],
                                value: response[key]
                            });
                        }
                        this.FDDfieldOptions3 = options;
                    }

                }).catch((error) => {
                    this.isLoading = false;
                    //alert('In Error' + error);
                    console.log(error);
                });
            } else {

                this.isSelectedLookupField = false;
                let selectedField = this.selectedLookupField2;
                if (this.selectedLookupField.includes('__c')) {
                    this.queryField2 = this.selectedLookupField.replace("__c", "__r.") + selectedField;
                } else if (this.selectedLookupField.slice(-2) == 'Id') {
                    this.queryField2 = this.selectedLookupField.replace("Id", ".") + selectedField;
                }
                //this.queryField2 = this.queryField1+this.selectedLookupField2;															  
            }

            if (this.CurrentFieldType == "RelatedRecord") {
                this.showFields = this.queryField2;
            } else {
                this.showFields = this.templateData.parentObjectName + '.' + this.queryField2;
            }

        } catch (ex) {
            this.isLoading = false;
            console.log('Error > ' + e)
        }

    }

    handleFieldChange3(event) {
        try {
            this.showFields = '';
            this.queryField3 = '';
            this.selectedLookupField3 = event.detail.value;
            //  console.log('selectedLookupField3 > ' + this.selectedLookupField3);
            //  console.log('selectedObject > ' + this.selectedObject);
            if (this.selectedLookupField3.includes(">")) {

                this.selectedLookupField3 = this.selectedLookupField3.replace(" > ", "")
                if (this.selectedLookupField3) {
                    let selectedField = this.selectedLookupField3;
                    if (this.selectedLookupField2.includes("__c")) {
                        this.queryField3 = this.queryField2 + this.selectedLookupField2.replace("__c", "__r.") + selectedField;
                    } else if (this.selectedLookupField2.slice(-2) == 'Id') {
                        this.queryField3 = this.queryField2 + this.selectedLookupField2.replace("Id", ".") + selectedField;
                    }
                }
            } else {

                let selectedField = this.selectedLookupField3;
                if (this.queryField2.includes("__c")) {
                    this.queryField3 = this.queryField2.replace("__c", "__r.") + selectedField;
                } else if (this.queryField2.slice(-2) == 'Id') {
                    this.queryField3 = this.queryField2.replace("Id", ".") + selectedField;
                }
                //this.queryField3 = this.queryField2+this.selectedLookupField3;
            }

            if (this.CurrentFieldType == "RelatedRecord") {
                this.showFields = this.queryField3;
            } else {
                this.showFields = this.templateData.parentObjectName + '.' + this.queryField3;
            }

        } catch (ex) {

            this.isLoading = false;
            // console.log('Error > ' + e)
        }
    }
    handleParentFieldSelectionOpen(event) {
        console.log('--=--section in template editor --=--' + JSON.stringify(this.section));
        this.CurrentFieldKey = event.currentTarget.dataset.id;
        console.log('--=-- currentFiled Key is --=--' + JSON.stringify(this.CurrentFieldKey));
        this.CurrentFieldType = event.currentTarget.dataset.type;
        let objectName = this.templateData.parentObjectName;

        if (this.CurrentFieldType == "RelatedRecord") {
            let currentSection = this.templateData.sections.find(ele => ele.key === this.CurrentFieldKey);
            //currentSection.queryJSONobj['fields'] = selectedFields;
            // console.log('objectName1', currentSection.queryJSONobj.objectName);
            // console.log('objectName2', currentSection.queryJSONobj['objectName']);
            objectName = currentSection.queryJSONobj.objectName;
        }

        try {
            fetchFieldInfo({
                searchKey: '',
                sObjectApiName: objectName
            }).then(data => {

                // console.log(data);
                var items = [];
                for (var j = 0; j < data.length; j++) {

                    //  console.log(data[j]);
                    var item;
                    if (data[j].IsLookup) {
                        item = {
                            "label": data[j].FielAPIName + ' >',
                            "value": data[j].FielAPIName
                        };
                    } else {
                        item = {
                            "label": data[j].FielAPIName,
                            "value": data[j].FielAPIName
                        };
                    }

                    items.push(item);

                }

            }).catch(error => {
                // console.log('error ');
                if (error.body) {
                    showCustomToast(this, 'Error', error.body.message, 'error');
                } else {
                    // alert('failure:' + error);
                }

                return;

            });

            this.isParentFieldSelectionOpen = true;
            //this.handleObjectChange2(this.templateData.parentObjectName);
            this.handleObjectChange2(objectName);


        } catch (error) {
            alert(error);
        }


    }

    handleParentFieldSelectionClose(event) {

        this.isParentFieldSelectionOpen = false;
    }

    handleParentFieldSelectionSelect(event) {
        try {
            this.isParentFieldSelectionOpen = false;
            this.addReferenceField(event); //SSR
        } catch (ex) {
            this.isLoading = false;
            // console.log('Error > ' + e)
        }
    }


    generateSection(event) {

        if ((this.templateData.parentObjectName === "") || (this.templateData.recordType === "")) {
            showCustomToast(this, 'Error', 'Please select object and record type.', 'error');
            return;
        }

        // if (!this.isRecordEdit) {
        //     showCustomToast(this, 'Error', 'Please save the document template first to be able to use Generate Sections.', 'error');
        //     return;
        // }
        if ((this.templateData.parentObjectName != this.savedObjectName) || (this.templateData.recordType != this.savedRT)) {
            showCustomToast(this, 'Error', 'Please save object and record type.', 'error');
            return;
        }

        if (this.templateData.sections.length > 0) {
            this.isSectionSaved = true;
            return;
        } else {
            this.isSectionSaved = false;
            this.isLoading = true;
            //pRecordType: this.selectedRT

            //pRecordType: this.selectedRT
            createDefaultTemplateUsingToolingAPI({

                pTemplateId: this.templateId,
                pObjectName: this.selectedObject,
                pRecordType: this.templateData.recordType
            })
                .then(data => {
                    this.isLoading = false;
                    window.location.reload();
                }).catch(error => {
                    this.isLoading = false;
                    //show error message
                    // console.log('error');
                    // console.error(error);
                    showCustomToast(this, 'Error', error.body.message, 'error');
                });
        }
    }

    /** Lifecycle Hooks */
    connectedCallback() {
        if (!this.isRecordEdit && !this.isRecordClone) {
            this.iconName = 'action:new';
            this.iconTitle = 'New Template';
            this.operation = 'New';
            this.resetTemplateData();
            this.stringifiedInitialTemplateData = JSON.stringify(this.templateData);
        } else if (this.isRecordEdit) {
            this.iconName = 'action:edit';
            this.iconTitle = 'Edit Template';
            this.operation = 'Edit';
        } else if (this.isRecordClone) {
            this.iconName = 'action:clone';
            this.iconTitle = 'Clone Template';
            this.operation = 'Clone';
        }



        this.isLoading = false;
    }

    /** Template data change handlers */

    handleTemplateNameChange(event) {
        this.templateData.name = event.target.value;
    }

    handleTemplateTypeChange(event) {
        this.templateData.type = event.detail.value;
    }

    handleTemplateVersionChange(event) {
        this.templateData.version = event.target.value;
    }

    handleAllowAttachAsPDFChange(event) {
        this.templateData.allowAttachAsPDF = event.target.checked;
    }

    handleAllowSendAsEmailAttachmentChange(event) {
        this.templateData.allowSendAsEmailAttachment = event.target.checked;
    }

    handleAllowEsignChange(event) {
        this.templateData.allowEsign = event.target.checked;
        if (!this.templateData.allowEsign) {
            this.resetAdditionalInfoJSON();
        }
    }

    handleApproverNameReferenceChange(event) {
        this.additionalInfoJSON.approverNameRef = event.target.value;
    }
    handleApproverEmailReferenceChange(event) {
        this.additionalInfoJSON.approverEmailRef = event.target.value;
    }

    handleTemplateDepartmentChange(event) {
        this.templateData.department = event.detail.value;
    }
    handleTemplateBUChange(event) {
        this.templateData.businessUnit = event.detail.value;
    }
    handlePageSizeChange(event) {
        this.templateData.pagesize = event.detail.value;
    }
    handleDescriptionChange(event) {
        this.templateData.description = event.target.value;
    }

    handleIsActiveChange(event) {
        this.templateData.isActive = event.target.checked;
        if (this.templateData.isActive) {
            this.disableDefault = false;
        } else {
            this.templateData.isDefault = false;
            this.disableDefault = true;
        }
    }
    handleIsDefaultChange(event) {
        this.templateData.isDefault = event.target.checked;
    }
    /** Section data change handlers */

    handleshowSectionCopyLookup(event) {
        this.showSectionCopyLookup = event.target.checked;
    }

    handleshowSectionCheck(event) {
        this.showSectionCopyLookuptop = event.target.checked;
    }

    handleSectionNameChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.name = event.target.value;
    }

    handleOrderSequenceChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.orderSequence = event.detail.value;

    }

    handleSectionContentTypeChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.contentType = event.detail.value;
        currentSection.isBodyContent = (currentSection.contentType === BODY ||
            currentSection.contentType === RELATED_RECORDS ||
            currentSection.contentType === CUSTOM_CONTENT);
        currentSection.isRelatedRecords = currentSection.contentType === RELATED_RECORDS;
        currentSection.isCustomContent = currentSection.contentType === CUSTOM_CONTENT;

        if (currentSection.isBodyContent ||
            currentSection.contentType === HEADER ||
            currentSection.contentType === FOOTER) {

            currentSection.isPageBreak = false;
            currentSection.isBlankPage = false;
            if (currentSection.name == PAGE_BREAK || currentSection.name == BLANK_PAGE) {
                currentSection.name = '';
            }
        }

        if (currentSection.contentType === BODY ||
            currentSection.contentType === HEADER ||
            currentSection.contentType === FOOTER) {

            currentSection.content = '';
        }

        if (currentSection.contentType === RELATED_RECORDS) {
            currentSection.name = RELATED_RECORDS;
            currentSection.content = '[TABLE_PLACEHOLDER]';
            this.resetQueryJsonObj(currentSection, RELATED_RECORDS);
        }

        if (currentSection.contentType === CUSTOM_CONTENT) {
            currentSection.name = CUSTOM_CONTENT;
            currentSection.content = CUSTOM_CONTENT_PLACEHOLDER;
            this.resetQueryJsonObj(currentSection, CUSTOM_CONTENT);
        }

        if (currentSection.contentType === PAGE_BREAK) {
            currentSection.isPageBreak = true;
            currentSection.isBlankPage = false;
            currentSection.name = PAGE_BREAK;
            currentSection.content = '';
        } else if (currentSection.contentType === BLANK_PAGE) {
            currentSection.isPageBreak = false;
            currentSection.isBlankPage = true;
            currentSection.name = BLANK_PAGE;
            currentSection.content = '';
        }
        currentSection.isPageBreakOrBlankPage = (currentSection.isPageBreak || currentSection.isBlankPage);
    }

    handleEnableLandscapeLayoutChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.isLandscapeLayout = event.target.checked;
    }

    handleSectionInputTypeTextChange(event) {
        let label = event.currentTarget.dataset.label;
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        if (label.split('.')[0] === 'queryJSONobj') {
            currentSection.queryJSONobj[label.split('.')[1]] = event.target.value;
        } else {
            currentSection[event.currentTarget.dataset.label] = event.target.value;
        }
    }

    handleSectionComboBoxChange(event) {
        let label = event.currentTarget.dataset.label;
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        if (label.split('.')[0] === 'queryJSONobj') {
            currentSection.queryJSONobj[label.split('.')[1]] = event.detail.value;
            if (label.split('.')[1] === 'customType' && event.detail.value === HTML) {
                currentSection.queryJSONobj.isCustomJson = false;
                currentSection.content = CUSTOM_CONTENT_PLACEHOLDER;
            } else if (label.split('.')[1] === 'customType' && event.detail.value === JSON_STR) {
                currentSection.queryJSONobj.isCustomJson = true;
                currentSection.content = '';
            }
        } else {
            currentSection[event.currentTarget.dataset.label] = event.detail.value;
        }
    }

    handleSectionQueryJSONChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        if (currentSection && !currentSection.hasOwnProperty('queryJSONobj')) {
            this.resetQueryJsonObj(currentSection, RELATED_RECORDS);
        } else if (currentSection && currentSection.hasOwnProperty('queryJSONobj')) {
            let dataLabel = event.currentTarget.dataset.label;
            if (dataLabel === 'enableTableHeader' ||
                dataLabel === 'enableAlternateRowStyle') {
                currentSection.queryJSONobj[dataLabel] = event.target.checked;
            } else {
                currentSection.queryJSONobj[dataLabel] = event.target.value;
            }
        }
    }

    //update child field selected in wrapper
    handleChildFieldSelection(event) {
        let selectedFields = [];
        let sectionKey = event.detail.sectionKey;
        let sectionLabel = event.detail.sectionLabel;
        let currentSection = this.templateData.sections.find(ele => ele.key === sectionKey);
        if (currentSection && !currentSection.hasOwnProperty('queryJSONobj')) {
            this.resetQueryJsonObj(currentSection, RELATED_RECORDS);
        } else if (currentSection && currentSection.hasOwnProperty('queryJSONobj')) {
            for (var i = 0; i < event.detail.selectedValue.length; i++) {
                selectedFields.push(event.detail.selectedValue[i].recName);
            }
            currentSection.queryJSONobj[sectionLabel] = selectedFields;
        }
        //  console.log('this.templateData');
        //  console.log('currentSection', currentSection);
        //  console.log(JSON.stringify(this.templateData));
    }
    //method to update the wrapper on the child object selection
    handleSectionQueryJSONChangeObject(event) {
        let childObjectName = event.detail.selectedValue;
        let fieldLabel = event.detail.selectedLabel;
        let fieldKey = event.detail.selectedRecordId;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey);
        if (currentSection && !currentSection.hasOwnProperty('queryJSONobj')) {
            this.resetQueryJsonObj(currentSection, RELATED_RECORDS);
        } else if (currentSection && currentSection.hasOwnProperty('queryJSONobj')) {
            let dataLabel = fieldLabel;
            currentSection.queryJSONobj[dataLabel] = childObjectName; //update the wrapper with child object name
        }

        this.fetchChildObjectFields(event, childObjectName);
        //SKP:To fetch ParentFieldAPI based on child object selected
        if (childObjectName) {
            this.fetchParentFieldAPI();
            this.setParentFieldAPI(currentSection, childObjectName);
        } else {
            currentSection.queryJSONobj['parentFieldApiName'] = '';
        }
    }

    handleRemoveObject(event) {
        let fieldKey = event.detail.selectedRecordId;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey);
        if (currentSection && currentSection.hasOwnProperty('queryJSONobj')) {
            currentSection.queryJSONobj['parentFieldApiName'] = '';
        }
    }
    fetchParentFieldAPI() {

        getReferenceFieldAPIName({
            parentObjectName: this.templateData.parentObjectName
        }).then((response) => {
            console.log(JSON.stringify(response));
            if (response) {

                let options = [];

                for (var key in response) {
                    options.push({
                        label: response[key],
                        value: response[key]
                    });
                    console.log(response[key]);
                }
                var uniqueOptions = [];
                var itemsFound = {};
                for (var i = 0, l = options.length; i < l; i++) {
                    var stringified = JSON.stringify(options[i]);
                    if (itemsFound[stringified]) {
                        continue;
                    }
                    uniqueOptions.push(options[i]);
                    itemsFound[stringified] = true;
                }
                console.log(options.length);
                console.log(uniqueOptions.length);

                this.parentFieldAPIOptions = uniqueOptions;
            } else {

                this.parentFieldAPIOptions = [];
            }

        }).catch((error) => {

            alert('In Error' + error);
            console.log(error);
        });
    }

    setParentFieldAPI(currentSection, childObjectName) {
        getRealtionshipName({
            parentObjectName: this.templateData.parentObjectName,
            childObjectName: childObjectName
        }).then((response) => {
            // console.log('setParentFieldAPI' + JSON.stringify(response));
            if (response && response.length > 0) {
                currentSection.queryJSONobj['parentFieldApiName'] = response.toString();

            } else {
                console.log('noresponse');
            }

        }).catch((error) => {

            alert('In Error' + error);
            console.log(error);
        });
    }

    fetchChildObjectFields(event, childObjectName) {

        getRelatedLookUpObjectFields2({
            selectedLookupField2: null,
            selectedLookupField: null,
            selectedObject: childObjectName

        }).then((response) => {
            this.isLoading = false;
            //  console.log(response);

            if (response && response.length > 0) {

                let options = [];
                for (var key in response) {
                    options.push({
                        label: response[key],
                        value: response[key]
                    });
                }
                this.childObjectFields = options;
                //this.isDefaultLookupField = false;
            } else {
                this.childObjectFields = [];
            }

        }).catch((error) => {
            this.isLoading = false;
            alert('In Error' + error);
            console.log(error);
        });
    }

    handleShowTableStyleChange(event) {
        this.showTableStyle = event.target.checked;
    }

    handleVisibilityChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.visibility = event.detail.value;
    }

    handleAlignmentChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.alignment = event.detail.value;
    }

    handleSectionContentChange(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        currentSection.content = event.target.value;
    }

    //Preview
    show = false;
    handleChange(event) {
        this.show = event.target.checked;
    }
    //Preview end
    /** Field data change handlers */

    handleFieldNameChange(event) {
        let fieldKey = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let currentField = currentSection.fields.find(ele => ele.key === fieldKey);
        currentField.name = event.target.value;
    }

    handleFieldTypeChange(event) {
        let fieldKey = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let currentField = currentSection.fields.find(ele => ele.key === fieldKey);
        currentField.type = event.detail.value;
        if (currentField.type === 'Picklist') {
            currentField.isPicklist = true;
            currentField.isDate = false;
        } else if (currentField.type === 'Date') {
            currentField.isDate = true;
            currentField.isPicklist = false;
            currentField.dateFormat = 'MM-dd-yyyy';
        } else {
            currentField.isPicklist = false;
            currentField.isDate = false;
        }
    }

    handlePlaceholderContentChange(event) {
        let fieldKey = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let currentField = currentSection.fields.find(ele => ele.key === fieldKey);
        currentField.placeholderContent = event.target.value;
    }

    //update the reference field in the template data wrapper
    handleReferenceFieldChange(event) {
        let fieldName = event.detail.selectedValue;
        let fieldKey = event.detail.selectedRecordId;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let currentField = currentSection.fields.find(ele => ele.key === fieldKey);
        currentField.referenceField = fieldName;
        //   console.log('fieldName > ' + fieldName);

    }

    handlePicklistValuesChange(event) {
        let fieldKey = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let currentField = currentSection.fields.find(ele => ele.key === fieldKey);
        currentField.picklistValues = event.target.value;
    }

    /** Other handlers */

    handleClose(event) {
        if (this.stringifiedInitialTemplateData === JSON.stringify(this.templateData) ||
            this.templateData.isReadOnly) {
            this.close();
        } else {
            this.isConfirmCloseOpen = true;
        }
    }

    handleCancel() {
        this.isConfirmCloseOpen = false;
    }

    close() {
        if (this.isRecordClone) {
            this.navigateToViewTemplatePage(this.templateId);
        } else if (!this.isRecordClone) {
            if (!this.isRecordEdit && this.newTemplateId == '') {
                //if New and record not created
                this.navigateToTemplateListView();
            } else if (!this.isRecordEdit && this.newTemplateId) {
                //if New and record created
                this.navigateToViewTemplatePage(this.newTemplateId);
            } else {
                //if Edit
                this.navigateToViewTemplatePage(this.templateId);
            }
        }
    }

    handleAddSection(event) {
        this.addSection();
    }

    handleRemoveSection(event) {
        let sectionKey = event.currentTarget.dataset.id;
        this.sectionToRemove = this.templateData.sections.find(ele => ele.key === sectionKey);
        this.isRemoveSectionOpen = true;
    }

    handleConfirmRemoveSection(event) {
        this.isLoading = true;
        if (this.sectionToRemove.id) {
            let idList = [];
            idList.push(this.sectionToRemove.id);
            for (let i in this.sectionToRemove.fields) {
                idList.push(this.sectionToRemove.fields[i].id);
            }
            deleteContent({
                contentIdList: idList
            })
                .then(resp => {
                    this.removeSectionFromUI(this.sectionToRemove.key);
                    this.sectionToRemove = {};
                    this.isLoading = false;
                    showCustomToast(this, 'Success', 'Record deleted successfully!', 'success');
                })
                .catch(error => {
                    this.isLoading = false;
                    showError(this, error);
                });
            this.isRemoveSectionOpen = false;
        } else if (this.sectionToRemove.key) {
            this.removeSectionFromUI(this.sectionToRemove.key);
            this.isRemoveSectionOpen = false;
            this.isLoading = false;
            this.sectionToRemove = {};
        }
    }

    removeSectionFromUI(sectionKey) {
        let indexPosition = -1;
        for (let i = 0; i < this.templateData.sections.length; i++) {
            if (this.templateData.sections[i].key === sectionKey) {
                indexPosition = i;
                break;
            }
        }
        this.templateData.sections.splice(indexPosition, 1);
    }

    handleRemoveSectionClose(event) {
        this.isRemoveSectionOpen = false;
        this.sectionToRemove = {};
    }


    handleAddField(event) {
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        //  console.log('currentSection >' + JSON.stringify(currentSection));
        if (currentSection.fields.length) {
            let oSeq = currentSection.fields[currentSection.fields.length - 1].orderSequence + 1;
            console.log('oSeq >' + oSeq);
            currentSection.fields.push({
                id: '',
                key: currentSection.key + '-' + oSeq,
                sectionKey: currentSection.key,
                name: '',
                type: 'String',
                orderSequence: oSeq,
                referenceField: '',
                placeholderContent: '',
                picklistValues: '',
                dateFormat: 'MM-dd-yyyy'
            });
        } else {
            currentSection.fields.push({
                id: '',
                key: currentSection.key + '-1',
                sectionKey: currentSection.key,
                name: '',
                type: 'String',
                orderSequence: 1,
                referenceField: '',
                placeholderContent: '',
                picklistValues: '',
                dateFormat: 'MM-dd-yyyy'
            });
        }

    }
    //SSR:S
    addReferenceField(event) {
        try {

            if (this.CurrentFieldType == "Body") {
                if (this.CurrentFieldKey) {
                    let currentSection = this.templateData.sections.find(ele => ele.key === this.CurrentFieldKey.split('-')[0]);
                    let currentField = currentSection.fields.find(ele => ele.key === this.CurrentFieldKey);
                    currentField.referenceField = this.showFields;
                }
            } else {
                let selectedFields = [];
                let sectionKey = this.CurrentFieldKey;
                let currentSection = this.templateData.sections.find(ele => ele.key === sectionKey);
                var selectedElemented = this.template.querySelector('c-multiselect-combobox[data-id="' + this.CurrentFieldKey + '"]');
                if (currentSection && !currentSection.hasOwnProperty('queryJSONobj')) {
                    this.resetQueryJsonObj(currentSection, RELATED_RECORDS);
                } else if (currentSection && currentSection.hasOwnProperty('queryJSONobj')) {
                    let selectedRecords = selectedElemented.getselectedrecordToPopup();
                    for (var i = 0; i < selectedRecords.length; i++) {
                        selectedFields.push(selectedRecords[i].recId);
                    }
                    selectedFields.push(this.showFields);
                    currentSection.queryJSONobj['fields'] = selectedFields;

                }

                selectedElemented.setSelectedrecordFromPopup(this.showFields);
            }

            //   console.log('this.templateData > ');
            //  console.log(JSON.stringify(this.templateData));

        } catch (ex) {
            console.log('Error >' + ex);
        }
    }
    //SSR:E
    handleOpenNewWindow(event) {
        let sectionId = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.id === sectionId);
        window.open('/apex/DocuPadAdvanceEditor?recordId=' + currentSection.id);
    }

    handleRefreshSection(event) {
        refreshApex(this.response);
    }

    handleRemoveField(event) {
        let fieldKey = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        this.fieldToRemove = currentSection.fields.find(ele => ele.key === fieldKey);
        if (this.fieldToRemove.id) {
            this.isRemoveFieldOpen = true;
        } else if (this.fieldToRemove.key) {
            this.removeFieldFromUI(this.fieldToRemove.key);
            this.fieldToRemove = {};
        }
    }

    handleConfirmRemoveField(event) {
        this.isLoading = true;
        let idList = [];
        idList.push(this.fieldToRemove.id);
        deleteContent({
            contentIdList: idList
        })
            .then(resp => {
                this.removeFieldFromUI(this.fieldToRemove.key);
                this.fieldToRemove = {};
                this.isLoading = false;
                showCustomToast(this, 'Success', 'Record deleted successfully!', 'success');
            })
            .catch(error => {
                this.isLoading = false;
                showError(this, error);
            });
        this.isRemoveFieldOpen = false;
    }

    removeFieldFromUI(fieldKey) {
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let indexPosition = -1;
        for (let i = 0; i < currentSection.fields.length; i++) {
            if (currentSection.fields[i].key === fieldKey) {
                indexPosition = i;
                break;
            }
        }
        currentSection.fields.splice(indexPosition, 1);
    }

    handleRemoveFieldClose(event) {
        this.fieldToRemove = {};
        this.isRemoveFieldOpen = false;
    }

    handleSave(event) {
        this.isConfirmCloseOpen = false;
        let isAllValid = this.validateFields();
        if (isAllValid) {
            this.isLoading = true;
            const fields = {};
            if (this.isRecordEdit) {
                fields[TEMPLATE_ID.fieldApiName] = this.templateData.id;
            }
            fields[TEMPLATE_NAME.fieldApiName] = this.templateData.name;
            fields[TEMPLATE_DEPARTMENT.fieldApiName] = this.templateData.department;
            fields[TEMPLATE_PAGE_SIZE.fieldApiName] = this.templateData.pagesize;
            fields[TEMPLATE_TYPE.fieldApiName] = this.templateData.type;
            fields[TEMPLATE_VERSION.fieldApiName] = this.templateData.version;
            fields[TEMPLATE_IS_ACTIVE.fieldApiName] = this.templateData.isActive;
            fields[TEMPLATE_IS_DEFAULT.fieldApiName] = this.templateData.isDefault;
            fields[TEMPLATE_DESCRIPTION.fieldApiName] = this.templateData.description;
            fields[TEMPLATE_BU.fieldApiName] = this.templateData.businessUnit;
            fields[TEMPLATE_ALLOW_ATTACH_AS_PDF.fieldApiName] = this.templateData.allowAttachAsPDF;
            fields[TEMPLATE_ALLOW_SEND_AS_EMAIL_ATTACHMENT.fieldApiName] = this.templateData.allowSendAsEmailAttachment;
            fields[TEMPLATE_ALLOW_ESIGN.fieldApiName] = this.templateData.allowEsign;
            fields[TEMPLATE_ADDITIONAL_INFO.fieldApiName] = JSON.stringify(this.additionalInfoJSON);
            fields[TEMPLATE_PARENT_OBJ_NAME.fieldApiName] = this.templateData.parentObjectName;
            fields[TEMPLATE_RECORD_TYPE.fieldApiName] = this.templateData.recordType;
            fields[PARENT_TEMPLATE_ID.fieldApiName] = this.templateData.parentTemplateId;

            if (!this.isRecordEdit) {
                const recordInput = {
                    apiName: DOCUMENT_TEMPLATE.objectApiName,
                    fields: fields
                };

                createRecord(recordInput)
                    .then(doctemplate => {
                        this.newTemplateId = doctemplate.id;
                        for (let i in this.templateData.sections) {
                            let section = this.templateData.sections[i];
                            if (section.isRelatedRecords || section.isCustomContent) {

                                if (section.queryJSONobj.fields) {
                                    section.queryJSONobj.fields = section.queryJSONobj.fields.join();
                                }
                                section.queryJSON = JSON.stringify(section.queryJSONobj);
                            }
                        }

                        upsertSectionAndFields({
                            templateId: doctemplate.id,
                            sections: this.templateData.sections
                        })
                            .then(resp => {
                                showCustomToast(this, 'Success', 'Records saved successfully!', 'success');
                                // this.resetTemplateData();
                                this.isLoading = false;
                                this.navigateToEditTemplatePage(this.newTemplateId);
                                //  this.navigateToViewTemplatePage(this.newTemplateId);
                            })
                            .catch(error => {
                                showError(this, error);
                                this.isLoading = false;
                            });

                    })
                    .catch(error => {
                        if (error.body && error.body.enhancedErrorType &&
                            error.body.enhancedErrorType.toLowerCase() === 'recorderror' &&
                            error.body.output) {

                            if (error.body.output.errors.length &&
                                error.body.output.errors[0].errorCode === 'DUPLICATE_VALUE'
                                || error.body.output.fieldErrors &&
                                error.body.output.fieldErrors.Name &&
                                error.body.output.fieldErrors.Name.length &&
                                error.body.output.fieldErrors.Name[0].errorCode === 'FIELD_CUSTOM_VALIDATION_EXCEPTION') {
                                showCustomToast(this, 'Error', 'Template Name should be unique.', 'error');
                            }
                            else
                                showError(this, error);

                        }
                        else {
                            showError(this, error);
                        }
                        this.isLoading = false;
                    });
            } else {
                const recordInput = {
                    fields: fields
                };
                updateRecord(recordInput)
                    .then(doctemplate => {
                        for (let i in this.templateData.sections) {
                            let section = this.templateData.sections[i];
                            if (section.isRelatedRecords || section.isCustomContent) {
                                if (section.queryJSONobj.fields) {
                                    section.queryJSONobj.fields = section.queryJSONobj.fields.join();
                                }
                                section.queryJSON = JSON.stringify(section.queryJSONobj);
                            }
                        }

                        //  console.log('this.templateData.sections');
                        //  console.log(this.templateData.sections);

                        upsertSectionAndFields({
                            templateId: this.templateData.id,
                            sections: this.templateData.sections
                        })
                            .then(resp => {
                                showCustomToast(this, 'Success', 'Records saved successfully!', 'success');
                                refreshApex(this.response);
                                this.isLoading = false;
                                this.navigateToEditTemplatePage(this.templateId);
                                //   this.navigateToViewTemplatePage(this.templateId);
                            })
                            .catch(error => {
                                showError(this, error);
                                this.isLoading = false;
                            });
                    })
                    .catch(error => {
                        if (error.body && error.body.enhancedErrorType &&
                            error.body.enhancedErrorType.toLowerCase() === 'recorderror' &&
                            error.body.output) {
                            if (error.body.output.errors.length &&
                                error.body.output.errors[0].errorCode === 'DUPLICATE_VALUE'
                                || error.body.output.fieldErrors &&
                                error.body.output.fieldErrors.Name &&
                                error.body.output.fieldErrors.Name.length &&
                                error.body.output.fieldErrors.Name[0].errorCode === 'FIELD_CUSTOM_VALIDATION_EXCEPTION') {
                                showCustomToast(this, 'Error', 'Template Name should be unique.', 'error');
                            }
                            else
                                showError(this, error);
                        }
                        else {
                            showError(this, error);
                        }

                        this.isLoading = false;
                    });
            }
        } else if (this.isDuplicateSequenceOrder) {
            this.isDuplicateSequenceOrder = false;
            showError(this, 'Duplicate sequence order found.')
        } else {
            showError(this, 'Field values Invalid or missing.');
        }
    }

    resetTemplateData() {
        //ABDS:Added version 1.0
        this.templateData = {
            name: '',
            type: '',
            version: '1.0',
            sections: []
        };

        //  this.addSection(); SKP: commented as per user story W-000022
    }

    resetQueryJsonObj(currentSection, content) {
        if (content === RELATED_RECORDS) {
            currentSection.queryJSONobj = {
                "fields": "",
                "objectName": "",
                "parentFieldApiName": "",
                "filter": "",
                "orderByField": "",
                "orderBy": "",
                "recordLimit": "50",
                "tableStyle": "width: 100%;",
                "enableTableHeader": true,
                "tableHeaderStyle": "border: 1px solid black;text-align: left;padding: 8px;",
                "tableHeaderRowStyle": "",
                "row1Style": "",
                "enableAlternateRowStyle": false,
                "row2Style": "",
                "cellStyle": "border: 1px solid black;text-align: left;padding: 8px;"
            };
        } else if (content === CUSTOM_CONTENT) {
            currentSection.queryJSONobj = {
                implementationClass: '',
                customType: HTML,
                customInput: '',
                isCustomJson: false,
                jsonAvailability: SECTION_LEVEL
            };
        }
    }

    addSection() {
        let tempKey = Math.random().toString(36).substring(2, 15);
        if (this.templateData.sections.length) {
            let oSeq = this.templateData.sections[this.templateData.sections.length - 1].orderSequence + 1;
            this.templateData['sections'].push({
                id: '',
                key: tempKey,
                name: 'Section ' + (this.templateData.sections.length + 1),
                contentType: BODY,
                isBodyContent: true,
                orderSequence: oSeq,
                isLandscapeLayout: false,
                content: '',
                fields: []
            });
        } else {
            this.templateData['sections'].push({
                id: '',
                key: tempKey,
                name: 'Section 1',
                contentType: BODY,
                isBodyContent: true,
                orderSequence: 1,
                isLandscapeLayout: false,
                content: '',
                fields: []
            });
        }
        this.activeSectionName = 'Section ' + this.templateData.sections.length;
    }

    //Get the dynamic identifier from custom metadata
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

    @wire(getObjectInfo, {
        objectApiName: DOCUMENT_TEMPLATE
    })
    getObjectData({
        error,
        data
    }) {
        if (data) {
            this.templateRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$templateRecordTypeId',
        fieldApiName: TEMPLATE_TYPE
    })
    getPicklistValues({
        error,
        data
    }) {
        if (data) {
            this.templateTypeOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }
    @wire(getPicklistValues, {
        recordTypeId: '$templateRecordTypeId',
        fieldApiName: TEMPLATE_BU
    })
    getBU({
        error,
        data
    }) {
        if (data) {

            this.templateBUOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }
    @wire(getPicklistValues, {
        recordTypeId: '$templateRecordTypeId',
        fieldApiName: TEMPLATE_PAGE_SIZE
    })
    getPageSize({
        error,
        data
    }) {
        if (data) {

            this.templatePSOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$templateRecordTypeId',
        fieldApiName: TEMPLATE_DEPARTMENT
    })
    getDepartment({
        error,
        data
    }) {
        if (data) {
            this.templateDepartmentOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getObjectInfo, {
        objectApiName: DOCUMENT_CONTENT
    })
    getContentObjectData({
        error,
        data
    }) {

        if (data) {
            this.contentRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$contentRecordTypeId',
        fieldApiName: FIELD_TYPE
    })
    getFieldTypePicklistValues({
        error,
        data
    }) {
        if (data) {
            this.fieldTypeOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$contentRecordTypeId',
        fieldApiName: CONTENT_TYPE
    })
    getContentTypePicklistValues({
        error,
        data
    }) {
        if (data) {
            this.contentTypeOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$contentRecordTypeId',
        fieldApiName: VISIBILITY
    })
    getVisibilityPicklistValues({
        error,
        data
    }) {
        if (data) {
            this.visibilityOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$contentRecordTypeId',
        fieldApiName: ALIGNMENT
    })
    getAlignmentPicklistValues({
        error,
        data
    }) {
        if (data) {
            this.alignmentOptions = data.values.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getTemplateData, {
        templateId: '$templateId'
    })

    wiredTemplateData(response) {
        if (response && response.data && (this.isRecordEdit || this.isRecordClone)) {
            console.log('wired template -> ', response);
            this.response = response;
            //get the date formats
            fetchDateFormats()
                .then(data => {
                    if (data != null) {
                        let dateFormat = JSON.parse(data);
                        let dateFormatTemp = dateFormat[DATE_FORMAT.fieldApiName].split(';');
                        this.dateFormats = [];
                        for (var i = 0; i < dateFormatTemp.length; i++) {
                            this.dateFormats.push({
                                label: dateFormatTemp[i],
                                value: dateFormatTemp[i]
                            });
                        }
                        this.templateData = JSON.parse(JSON.stringify(response.data));
                        this.savedObjectName = this.templateData.parentObjectName;
                        this.savedRT = this.templateData.recordType;
                        // SKP:s:to update version and document name on clone 
                        try {
                            if (this.isRecordClone && this.isCloneNewVersion) {
                                this.templateData.version = this.versionNumber;
                                this.templateData.isActive = false;
                                this.templateData.parentTemplateId = this.parentTemplateId;
                                this.templateData.isReadOnly = false;
                                this.templateData.isDefault = false;

                            } else if (this.isRecordClone && !this.isCloneNewVersion) {
                                this.templateData.version = '1.0';
                                this.templateData.name = this.templateName;
                                this.templateData.isActive = false;
                                this.templateData.isReadOnly = false;
                                this.templateData.isDefault = false;
                            }
                            if (this.templateData.isActive) {
                                this.disableDefault = false;
                            }
                            console.log('this.templateData.isReadOnly ' + this.templateData.isReadOnly);
                        } catch (error) {
                            console.log('Error in fetching Version number' + errormessage);
                        }
                        //SKP:e:to update version and document name on clone 

                        //ABDS:s:To fill the record Type
                        if (this.templateData.version != '1.0') {
                            this.disabledObjNTem = true;
                        }

                        this.handleObjectChange(this.templateData.parentObjectName);
                        //ABDS:e:To fill the record Type

                        //this.selectedRT = this.templateData.recordType; //SKP:to populate record type with selected value

                        this.initilizeAdditionalInfoJSON();
                        for (let i in response.data.sections) {
                            let section = this.templateData.sections[i];
                            console.log(JSON.stringify(section));
                            if (this.isRecordClone) {
                                section.id = '';
                            }
                            let tempKey = Math.random().toString(36).substring(2, 15);
                            section.key = tempKey;
                            if (section && (section.isRelatedRecords || section.isCustomContent) && section.queryJSON) {
                                section.queryJSONobj = JSON.parse(section.queryJSON);
                                if (section.queryJSONobj.fields) {
                                    section.queryJSONobj.fields = section.queryJSONobj.fields.split(',');
                                }
                            }
                            for (let j in section.fields) {
                                if (this.isRecordClone) {
                                    section.fields[j].id = '';
                                }
                                section.fields[j].key = tempKey + '-' + section.fields[j].orderSequence;
                                section.fields[j].sectionKey = tempKey;
                                if (section.fields[j].dateFormat === '' || section.fields[j].dateFormat === undefined) {
                                    section.fields[j].dateFormat = 'MM-dd-yyyy';
                                }
                            }
                        }
                        this.stringifiedInitialTemplateData = JSON.stringify(this.templateData);
                        if (this.templateData.parentObjectName) {
                            this.fetchChildObjects = this.templateData.parentObjectName + '-getChild';
                            this.fetchParentFieldAPI(); //SKP:to populate Parent Field API
                        }
                        getFieldNameForRefField({
                            objectName: this.templateData.parentObjectName
                        })
                            .then(data => {
                                if (data) {
                                    this.refFields = data;
                                }
                            })
                            .catch(error => {
                                showError(this, error);
                            });
                    }
                })
                .catch(error => {
                    showError(this, error);
                });
        } else if (response.data === undefined) {

            fetchDateFormats()
                .then(data => {
                    if (data != null) {
                        let dateFormat = JSON.parse(data);
                        let dateFormatTemp = dateFormat[DATE_FORMAT.fieldApiName].split(';');
                        this.dateFormats = [];
                        for (var i = 0; i < dateFormatTemp.length; i++) {
                            this.dateFormats.push({
                                label: dateFormatTemp[i],
                                value: dateFormatTemp[i]
                            });
                        }
                    }
                })
                .catch(error => {
                    showError(this, error);
                });
        } else if (response && response.error) {
            showError(this, response.error);
        }
    }

    @wire(isVFPageAvailable, {
        pageName: 'DocuPadAdvanceEditor'
    })
    wiredIsVFPageAvailable({
        error,
        data
    }) {
        if (data === true || data === false) {
            this.isAdvanceEditorPageAvailable = data;
        } else if (error) {
            showError(this, error);
        }
    }

    @wire(getOrgInfo, {
        referenceField: 'Id'
    })
    wiredGetOrgInfo({
        error,
        data
    }) {
        if (data) {
            this.organizationId = data;
        } else if (error) {
            showError(this, error);
        }
    }

    initilizeAdditionalInfoJSON() {
        if (!this.templateData.additionalInfoJSON) {
            this.additionalInfoJSON = {
                'approverNameRef': '',
                'approverEmailRef': '',
            };
        } else {
            this.additionalInfoJSON = JSON.parse(this.templateData.additionalInfoJSON);
        }
    }
    resetAdditionalInfoJSON() {
        // set additionalInfoJSON to an empty object
        this.additionalInfoJSON = {};
        // this.additionalInfoJSON.approverNameRef = '';
        // this.additionalInfoJSON.approverEmailRef = '';
    }

    validateFields() {


        let isValidSoFar = true;
        if (this.templateData.parentObjectName) {
            isValidSoFar = true;
        } else {
            isValidSoFar = false;

        }
        let existingSequences = [];
        for (let i in this.templateData.sections) {
            if (!existingSequences.includes(parseInt(this.templateData.sections[i].orderSequence))) {
                existingSequences.push(parseInt(this.templateData.sections[i].orderSequence));
            } else {
                this.isDuplicateSequenceOrder = true;
                isValidSoFar = false;

            }
        }
        this.template.querySelector('c-lookup-search').checkErrorMessage();

        this.template.querySelectorAll('lightning-input').forEach((element) => {
            if (element.value && element.value.trim() == '') {
                element.value = '';
            }
            if (isValidSoFar) {
                isValidSoFar = element.checkValidity();
            }
            element.reportValidity();
        });
        this.template.querySelectorAll('lightning-combobox').forEach((element) => {
            if (isValidSoFar) {
                isValidSoFar = element.checkValidity();
            }
            element.reportValidity();
        });
        this.template.querySelectorAll('lightning-textarea').forEach((element) => {
            if (element.value && element.value.trim() == '') {
                element.value = '';
            }
            if (isValidSoFar) {
                isValidSoFar = element.checkValidity();
            }
            element.reportValidity();
        });
        this.template.querySelectorAll('lightning-input-rich-text').forEach((element) => {
            // Remove all occurences of <p>, </p> and <br>
            let finalValue = element.value.split('<p>').join('')
                .split('<br>').join('')
                .split('</\p>').join('').trim();

            //covers value = "<p><br></p><p><br></p><p>       </p>" scenario
            if (element.value && (finalValue == '')) {
                element.value = '';
            }
            if (!element.value) {
                // checks for value undifined or ''
                isValidSoFar = false;
                this.rtfErrorMessage = !isValidSoFar ? 'Section contents can\'t be empty.' : '';
            }
        });
        return isValidSoFar;
    }
    navigateToEditTemplatePage(templateId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: templateId,
                objectApiName: 'Document_Template__c',
                actionName: 'edit'
            },
            state: {
                c__isShowSection: this.isShowSection,
                c__showSectionClass: this.showSectionClass
            }
        });
    }
    navigateToViewTemplatePage(templateId) {
        // Fix for redirection issue after delete
        /*this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: templateId,
                objectApiName: 'Document_Template__c',
                actionName: 'view'
            },
        });*/
        var hostname = window.location.hostname;
        window.location.href = 'https://' + hostname + '/lightning/r/Document_Template__c/' + templateId + '/view';

    }

    navigateToTemplateListView() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Document_Template__c',
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            },
        });
    }

    onRecordCopy(event) {
        this.documentContentRecordName = event.detail.selectedValue;
        this.documentContentRecordId = event.detail.selectedRecordId;
        let currentSection = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        if (this.documentContentRecordId) {
            getDocumentContentSectionWrapper({
                DocumentContentId: this.documentContentRecordId
            })
                .then(data => {
                    let tempKey = Math.random().toString(36).substring(2, 15);

                    if (this.templateData.sections.length) {
                        var oSeq = this.templateData.sections[this.templateData.sections.length - 1].orderSequence + 1;
                    } else if (!this.templateData.sections.length) {
                        var oSeq = 1;
                    }
                    this.SectionFromDataBase = data;
                    let sectionFromDataBaseCopy = Object.assign({}, this.SectionFromDataBase);
                    // adding queryJSONobj to section if section is Related records or Custom Content
                    if (sectionFromDataBaseCopy.contentType === RELATED_RECORDS || sectionFromDataBaseCopy.contentType === CUSTOM_CONTENT) {
                        this.resetQueryJsonObj(sectionFromDataBaseCopy, sectionFromDataBaseCopy.contentType);
                        if (sectionFromDataBaseCopy &&
                            (sectionFromDataBaseCopy.isRelatedRecords || sectionFromDataBaseCopy.isCustomContent) &&
                            sectionFromDataBaseCopy.queryJSON) {
                            sectionFromDataBaseCopy.queryJSONobj = JSON.parse(sectionFromDataBaseCopy.queryJSON);
                            //ANKIT
                            if (sectionFromDataBaseCopy.queryJSONobj.fields) {
                                sectionFromDataBaseCopy.queryJSONobj.fields = sectionFromDataBaseCopy.queryJSONobj.fields.split(',');
                            }

                        }
                    }
                    sectionFromDataBaseCopy.key = tempKey;
                    sectionFromDataBaseCopy.orderSequence = oSeq;
                    // updaing key and sectionKey for Fields
                    if (sectionFromDataBaseCopy.fields.length) {
                        var fieldArray = [];
                        var k = 1;
                        for (let i in sectionFromDataBaseCopy.fields) {
                            let field = sectionFromDataBaseCopy.fields[i];
                            let fieldCopy = Object.assign({}, field);
                            fieldCopy.key = tempKey + '-' + k;
                            fieldCopy.sectionKey = tempKey;
                            fieldArray.push(fieldCopy);
                            k++;
                        }
                        sectionFromDataBaseCopy.fields = fieldArray;
                    }
                    this.templateData['sections'].push(sectionFromDataBaseCopy);
                    this.documentContentRecordId = '';
                })
                .catch(error => {
                    showError(this, error);
                });
        }
    }

    handlePreviewExpanCollapse(event) {
        let iconName = JSON.stringify(this.template.querySelector('[data-id="previewbutton"]').iconName);
        if (iconName.includes('utility:preview')) {
            //change the icon to hide
            this.template.querySelector('[data-id="previewbutton"]').iconName = 'utility:hide';
        } else {
            //change the icon to preview
            this.template.querySelector('[data-id="previewbutton"]').iconName = 'utility:preview';
        }
        if (this.previewShow === true) {
            //hide the preview and expand the record
            this.previewShow = false;
            this.template.querySelector('[data-id="templateblock"]').classList.add('slds-size--12-of-12');
            this.template.querySelector('[data-id="templateblock"]').classList.remove('slds-size--1-of-2');
        } else if (this.previewShow === false) {
            //show the preview and collapse the record
            this.previewShow = true;
            this.template.querySelector('[data-id="templateblock"]').classList.remove('slds-size--12-of-12');
            this.template.querySelector('[data-id="templateblock"]').classList.add('slds-size--1-of-2');
        }
    }

    //handle on blur of rich text
    createAddField(event) {
        let currentFields = [];
        var currentSectionData = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id);
        if (!currentSectionData.isCustomContent) {
            let contentData = this.templateData.sections.find(ele => ele.key === event.currentTarget.dataset.id).content;
            contentData = contentData.replace(/(<([^>]+)>)/ig, ''); //loop on the rich text till the brackets are not found
            let i;
            for (i = 0; i < contentData.length - 1; i++) {
                //Check for opening bracket
                if (contentData[i] === this.metadataRecord[START_IDENTIFIER.fieldApiName]) {
                    var closingIndex = contentData.indexOf(this.metadataRecord[END_IDENTIFIER.fieldApiName], i);
                    //check if closing bracket is found
                    if (closingIndex > -1) {
                        const mainField = contentData.substring(i + 1, closingIndex);
                        if (mainField.toLowerCase() == 'table_placeholder') {
                            break;
                        }
                        let alreadyAdded = false;
                        //Retain the reference value of fields already added
                        let j;
                        for (j = 0; j < currentSectionData.fields.length; j++) {
                            if (currentSectionData.fields[j].name === mainField) {
                                currentFields.push({
                                    name: mainField,
                                    refValue: currentSectionData.fields[j].referenceField,
                                    dateFormatDetail: currentSectionData.fields[j].dateFormat,
                                    fieldTypeDetail: currentSectionData.fields[j].type
                                });
                                alreadyAdded = true;
                                break;
                            }
                        }
                        //if the field is not added already
                        if (alreadyAdded === false) {
                            let gotRefField = false;
                            //check if reference field is found in the parent object's fields
                            let m;
                            for (m = 0; m < this.refFields.length; m++) {
                                if (this.refFields[m].fieldLabel == mainField) {
                                    gotRefField = true;
                                    currentFields.push({
                                        name: mainField,
                                        refValue: this.refFields[m].fieldApiName,
                                        dateFormatDetail: '', //TODO: make this blank
                                        fieldTypeDetail: 'String'
                                    });
                                    break;
                                }
                            }
                            if (gotRefField === false) {
                                currentFields.push({
                                    name: mainField,
                                    refValue: '',
                                    dateFormatDetail: '', //TODO: make this blank
                                    fieldTypeDetail: 'String'
                                });
                            }
                        }
                    }
                }
            }
            //Push the fields into main wrapper
            currentSectionData.fields = [];
            for (let k = 0; k < currentFields.length; k++) {
                let isDateDetail = false;
                if (currentFields[k].fieldTypeDetail === 'Date') {
                    isDateDetail = true;
                }
                if (currentSectionData.fields.length !== 0) {
                    let oSeq = currentSectionData.fields[currentSectionData.fields.length - 1].orderSequence + 1;
                    currentSectionData.fields.push({
                        id: '',
                        key: currentSectionData.key + '-' + oSeq,
                        sectionKey: currentSectionData.key,
                        name: currentFields[k].name,
                        type: currentFields[k].fieldTypeDetail,
                        orderSequence: oSeq,
                        referenceField: currentFields[k].refValue,
                        placeholderContent: currentFields[k].name,
                        picklistValues: '',
                        dateFormat: currentFields[k].dateFormatDetail,
                        isDate: isDateDetail
                    });
                } else {
                    currentSectionData.fields.push({
                        id: '',
                        key: currentSectionData.key + '-1',
                        sectionKey: currentSectionData.key,
                        name: currentFields[k].name,
                        type: currentFields[k].fieldTypeDetail,
                        orderSequence: 1,
                        referenceField: currentFields[k].refValue,
                        placeholderContent: currentFields[k].name,
                        picklistValues: '',
                        dateFormat: currentFields[k].dateFormatDetail,
                        isDate: isDateDetail
                    });
                }
            }
        }
    }

    //handle event fired from lookup search for searching parent & child object
    handleParentObjectSelection(event) {

        //SKP:s:to clear record type selection if object is not selected
        if (event.detail.selectedValue == null) {
            //this.selectedRT = null;
            this.templateData.recordType = null; //this.selectedRT;
            this.objectName = event.detail.selectedValue;
        } else {
            //ABDS:s:To fill the record Type
            this.handleObjectChange(event.detail.selectedValue);
            //ABDS:e:To fill the record Type

            this.objectName = event.detail.selectedValue;
        } //SKP:e:to clear record type selection if object is not selected
        this.templateData.parentObjectName = this.objectName;
        this.fetchChildObjects = this.objectName + '-getChild';
        getFieldNameForRefField({
            objectName: this.templateData.parentObjectName
        })
            .then(data => {
                if (data) {
                    console.log('--data in look up search is --=--' + JSON.stringify(data));
                    this.refFields = data;
                }
            })
            .catch(error => {
                showError(this, error);
            });
    }
    handleRecordChange(event) {
        if (event.detail.selectedValue == null || event.detail.selectedValue == undefined || event.detail.selectedValue == '') {
            this.templateData.parentObjectName = null;
        }
    }
    removeParentObjectname() {
        this.templateData.parentObjectName = null;
    }
    //set wrapper on date format change
    handleDateFormatChange(event) {
        let fieldKey = event.currentTarget.dataset.id;
        let currentSection = this.templateData.sections.find(ele => ele.key === fieldKey.split('-')[0]);
        let currentField = currentSection.fields.find(ele => ele.key === fieldKey);
        currentField.dateFormat = event.detail.value;
    }
    dataupdate(event) {
        console.log(event.detail);
    }

    // removePillItem(event) {
    //     try{
    //         const pillIndex = event.detail.index ? event.detail.index : event.detail.name;
    //         const itempill = this.selRefFields;
    //         itempill.splice(pillIndex, 1);       
    //         this.selRefFields = [...itempill];
    //     }catch(ex){
    //         console.log('Exception > '+ex);
    //     }
    // }

    // handleShowSection(event) {
    //     let iconName = JSON.stringify(this.template.querySelector('[data-id="showSection"]').iconName);
    //     if (iconName.includes('utility:toggle_panel_left')) {
    //         //change the icon to up
    //         this.template.querySelector('[data-id="showSection"]').iconName = 'utility:toggle_panel_right';
    //     } else {
    //         //change the icon to down
    //         this.template.querySelector('[data-id="showSection"]').iconName = 'utility:toggle_panel_left';
    //     }
    //     if (this.isShowSection === true) {
    //         //hide the section block 
    //         this.isShowSection = false;
    //     } else if (this.isShowSection === false) {
    //         //show the section block 
    //         this.isShowSection = true;
    //     }
    // }

    //SSR
    handleShowSection(event) {
        try {
            if (this.isShowSection == true) {
                //hide the section block 
                this.isShowSection = false;
            } else if (this.isShowSection == false) {
                //show the section block 
                this.isShowSection = true;
            }
            let iconName = this.showSectionClass;
            if (iconName.includes('utility:toggle_panel_left')) {
                //change the icon to up
                this.showSectionClass = 'utility:toggle_panel_right';
            } else {
                //change the icon to down
                this.showSectionClass = 'utility:toggle_panel_left';
            }
        } catch (ex) {
            console.log('Error > ' + ex);
        }

    }

    handleGenerate(event) {
        this.isSectionSaved = false;
        this.isLoading = true;

        createDefaultTemplateUsingToolingAPI({
            pTemplateId: this.templateId,
            pObjectName: this.selectedObject,
            pRecordType: this.templateData.recordType
        })
            .then(data => {
                this.isLoading = false;
                window.location.reload();
            }).catch(error => {
                this.isLoading = false;

                showCustomToast(this, 'Error', error.body.message, 'error');
            });
    }

    closeGenerate() {
        this.navigateToEditTemplatePage(this.templateId);
        this.isSectionSaved = false;
    }

    cancelGenerate() {
        this.isSectionSaved = false;
    }

}