import { LightningElement, api, wire, track } from 'lwc';
import { showError } from 'c/utils';

/** Apex to fetch related records. */
import { refreshApex } from '@salesforce/apex';
import getTemplateById from '@salesforce/apex/FormHandler.getTemplateById';
import getTemplateByName from '@salesforce/apex/FormHandler.getTemplateByName'; 
import getTemplateError from '@salesforce/apex/FormHandler.getTemplateError'; 

/**
 * Component to create document from single template.
 */
export default class TemplateBox extends LightningElement {

    @api recordId;
    @api templateName;
    @api templateVersionNumber = 'V1';
    @track templateData = [];
    isTemplateErrorExist=false;
    TemplateError='';
    relatedRecordId = '';
    response;

    /** Lifecycle Hooks */
    connectedCallback() {
        if(this.recordId) {
            this.relatedRecordId = this.recordId;
        }
    }

    handleContentSave(event) {
        refreshApex(this.response);
		this.template.querySelector('[class="draft-content"]').refreshApexFromParent();
    }
    
    handleContentDelete(event) {
        refreshApex(this.response);
    }

    handleCreateNew(event) {
        this.template.querySelector('[class="form-contents"]').handleCreateNew(event);
    }

    handleOpenDraft(event) {
        this.template.querySelector('[class="draft-content"]').handleOpenDraft(event);
    }

    @wire(getTemplateByName, { templateName: '$templateName', relatedRecordId: '$relatedRecordId', templateVersionNumber: '$templateVersionNumber' })
    wiredTemplateById(response) {
        this.response = response;
        if (response.data) {
            this.templateData = response.data;
            this.error = undefined;
        } else if (response.error) {
            this.error = response.error;
            showError(this, this.error);
        }
    }

    // @wire(getTemplateError, { templateName: '$templateName', recordId: '$recordId' })
    // wiredTemplateError(response) {
    //     alert('this.recordId'+this.recordId);
    //     alert('this.templateName'+this.templateName);
    //     if (response.data) {
    //         alert('response.data');
    //         if (!response.data)
    //         {
    //             this.isTemplateErrorExist=true;
    //             this.TemplateError= response.data;
    //         }
    //         alert(response.data);
    //         //this.templateData = response.data;
    //         this.error = undefined;
    //     } else if (response.error) {
    //         this.error = response.error;
    //         showError(this, this.error);
    //     }
    // }
}