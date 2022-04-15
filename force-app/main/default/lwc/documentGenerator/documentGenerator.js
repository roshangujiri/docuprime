import { LightningElement, api, wire, track } from 'lwc';
import { showError, showCustomToast } from 'c/utils';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

/** Apex to fetch related records. */
import { refreshApex } from '@salesforce/apex';
import getTemplateTypes from '@salesforce/apex/FormHandler.getTemplateTypes';
import getFormList from '@salesforce/apex/FormHandler.getFormList';

/** Document_Template__c Schema. */
import DOCUMENT_TEMPLATE from '@salesforce/schema/Document_Template__c';
import TEMPLATE_TYPE from '@salesforce/schema/Document_Template__c.Template_Type__c';

/**
 * Allows to display template categories and create documents.
 */
export default class DocumentGenerator extends LightningElement {

    @api recordId;
    @api objectName = DOCUMENT_TEMPLATE.objectApiName;
    @api fieldName = TEMPLATE_TYPE.fieldApiName;
    @api recordTypeId;
    @api value;
    @api formId;
    @track fieldLabel;
    @track options = [];
    @track forms;
    @track formCategory;
    @track hasCorpDoc = false;
    @track hasCorpDocModalView = false;
    isFormCategoryAvailable = true;
    apiFieldName;
    response;
    selectedFormId ='';

    handleClose(event) {
        this.hasCorpDocModalView = false;
    }
   
    handleCreateNew(event) {
        this.selectedFormId = event.currentTarget.dataset.id;
        let selectedForm = this.forms.find(ele => ele.id === this.selectedFormId);
        if (!selectedForm.isCorpDocListEmpty) {
            this.hasCorpDocModalView = true; 
        }
        else {
            this.hasCorpDocModalView = false;
            this.template.querySelector('[class="form-contents"]').handleCreateNew(event, this.selectedFormId);
        }
    }

    handleChange(event) {
        this.value = event.detail.value;
        this.formCategory = event.detail.value;
    }

    handleConfirmCreate(event) {
        this.hasCorpDocModalView = false;
        this.template.querySelector('[class="form-contents"]').handleCreateNew(event, this.selectedFormId);
    }

    handleOpenDraft(event) {
        this.hasCorpDocModalView = false;
        this.template.querySelector('[class="draft-content"]').handleOpenDraft(event, this.selectedFormId);
    }

    handleContentSave(event) {
        refreshApex(this.response);
        this.template.querySelector('[class="draft-content"]').refreshApexFromParent();
    }
    
    handleContentDelete(event) {
        refreshApex(this.response);
    }

    @wire(getFormList, { formCategory: '$formCategory' })
    wiredFormContent(response) {
        this.response = response;
        if (response.data) {
            this.forms = response.data;
            this.error = undefined;
        } else if (response.error) {
            this.error = response.error;
            showError(this, this.error, 'wiredFormContent');
        }
    }

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    getObjectData({ error, data }) {
        if (data) {
            if (this.recordTypeId == null)
                this.recordTypeId = data.defaultRecordTypeId;
            this.apiFieldName = this.objectName + '.' + this.fieldName;
            this.fieldLabel = data.fields[this.fieldName].label;

        } else if (error) {
            showError(this, error, 'getObjectData');
        }
    }

    @wire(getTemplateTypes)
    wiredTemplateTypes({ error, data }) {
        if (data) {
            this.options = data.map(plValue => {
                return {
                    label: plValue.label,
                    value: plValue.value
                };
            });
            if(this.options.length === 1) {
                this.value = this.options[0].value;
                this.formCategory = this.options[0].value;
            } else if(this.options.length === 0) {
                this.isFormCategoryAvailable = false;
            }
        } else if(error) {
            showError(this, error, 'wiredTemplateTypes');
        }
    }
}