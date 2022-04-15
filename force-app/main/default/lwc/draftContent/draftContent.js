import { LightningElement, api, track, wire } from 'lwc';
import { showCustomToast, showError } from 'c/utils';
import { NavigationMixin } from 'lightning/navigation';
import { updateRecord, getRecord } from 'lightning/uiRecordApi';

/** Apex to fetch related records. */
import { refreshApex } from '@salesforce/apex';
import deleteDocument from '@salesforce/apex/FormHandler.deleteDocument';
import getDocumentTemplate from '@salesforce/apex/FormHandler.getDocumentTemplate';
import getDocumentList from '@salesforce/apex/FormHandler.getDocumentList';
import getDocumentById from '@salesforce/apex/FormHandler.getDocumentById';
import getFormContentList from '@salesforce/apex/FormHandler.getFormContentList';
import upsertDocContentList from '@salesforce/apex/FormHandler.upsertDocContentList';
import sendEmailWithAttachedDocument from '@salesforce/apex/EmailUtility.sendEmailWithAttachedDocument';
import saveAsPDFAttachment from '@salesforce/apex/PDFGeneratorController.saveAsPDFAttachment';
import saveDocumentAndSendForEsign from '@salesforce/apex/PDFGeneratorController.saveDocumentAndSendForEsign';
import fetchMetadataIdentifiers from '@salesforce/apex/TemplateIdentifierClass.fetchMetadataIdentifierRecs';
import composeEmailData from '@salesforce/apex/FormHandler.composeEmailData';
import renderEmailBody from '@salesforce/apex/FormHandler.renderEmailBody';

/** Corporate_Document__c Schema. */
import CORPDOC_ID_FIELD from '@salesforce/schema/Corporate_Document__c.Id';
import VERSION_FIELD from '@salesforce/schema/Corporate_Document__c.Version__c';
import TEMPLATEID_FIELD from '@salesforce/schema/Corporate_Document__c.Document_Template__c';
import STAGE_FIELD from '@salesforce/schema/Corporate_Document__c.Document_Stage__c';

/** Document_Content__c Schema. */
import DOC_ID_FIELD from '@salesforce/schema/Document_Content__c.Id';
import DOC_NAME_FIELD from '@salesforce/schema/Document_Content__c.Name';
import ORDER_SEQUENCE_FIELD from '@salesforce/schema/Document_Content__c.Order_Sequence__c';
import SECTION_CONTENT_FIELD from '@salesforce/schema/Document_Content__c.Section_Content__c';
import CORPORATE_DOC_FIELD from '@salesforce/schema/Document_Content__c.Corporate_Document__c';

/**App Setting Schema */
import START_IDENTIFIER from '@salesforce/schema/App_Settings__c.Start_Identifier__c';
import END_IDENTIFIER from '@salesforce/schema/App_Settings__c.End_Identifier__c';
/**
 * Component to edit, view as pdf, send document as email attachment and attach as record attachment etc.
 */
export default class DraftContent extends NavigationMixin(LightningElement) {

    @api recordId;
    @api templateId;
    @track isDocumentListOpen = false;
    @track isDocumentOpen = false;
    @track isDocumentEsignOpen = false;
    isDeleteDocument = false;
    @track documentRecordId = '';
    @track isComposeEmailOpen = false;
    @track documentList = {};
    @track isLoading;
    @track isDocumentEsignLoading = false;
    @track selectedDocument = {};
    @track templateContent = [];
    @track isEditMode = false;
    @track documentStyle = 'slds-col slds-scrollable slds-is-relative';
    @track emailSubject;
    @track emailMessage;
    @track toAddress;
    @track ccAddress;
    @track bccAddress = '';
    @track allowAttachAsPDF = false;
    @track allowSendAsEmailAttachment = false;
    @track allowEsign = false;
    @track approverName;
    @track approverEmail;
    @track docType = 'Pdf';
    @track emailTemplateNames = [];
    @track selectedEmailTemplate;
    //@track toAddress;
    additionalInfoJSON;
    refFields = [];
    serviceName;
    relatedRecordId = '';
    namespacePrefix
    resultRefresh;
    templateName;
    corpDocId;
    fieldValueMapList = [];
    hasCorpDoc = false;

    /** Current page in the document list. */
    pageNumber = 1;
    /** The number of documents on a page. */
    pageSize = 10;

    formats = ['font', 'size', 'bold', 'italic', 'underline',
        'strike', 'list', 'indent', 'align', 'link',
        'image', 'clean', 'table', 'header', 'color',
        'background', 'code', 'code-block', 'script',
        'blockquote', 'direction'];

    /** Lifecycle Hooks */
    connectedCallback() {
        if (ORDER_SEQUENCE_FIELD.fieldApiName.split('__').length === 3) {
            //console.log('Order sequence:'+this.namespacePrefix);
            this.namespacePrefix = ORDER_SEQUENCE_FIELD.fieldApiName.split('__')[0];
            //console.log('Namespaceprefix:'+this.namespacePrefix);
        }
        if (this.recordId) {
            this.relatedRecordId = this.recordId;
        }
    }
    renderedCallback() {
        // Apply CSS Class depending upon edit mode.
        if (this.isEditMode) {
            this.documentStyle = 'slds-col slds-size_3-of-4 slds-scrollable slds-is-relative content-section';
        } else {
            this.documentStyle = 'slds-col slds-scrollable slds-is-relative';
        }
        if (this.documentList && Array.isArray(this.documentList.records) && this.documentList.records.length) {
            this.isLoading = false;
        } else {
            this.isLoading = true;
        }
        if (this.isDelete && this.documentList && !this.documentList.records.length) {
            this.isDocumentListOpen = false;
            this.isDelete = false;
        }
    }

    /** Data change handlers */
    @api handleOpenDraft(event, templateId = null) {
        this.isDocumentListOpen = true;
        if (event.currentTarget.dataset.id)
            this.templateId = event.currentTarget.dataset.id;
        else if (templateId)
            this.templateId = templateId;
    }

    /**Identifier Wire */
    @wire(fetchMetadataIdentifiers)
    wiredRecs({ error, data }) {
        if (data) {
            if (data != null) {
                this.metadataRecord = JSON.parse(data);
            }
        }

    }

    handleDeleteDocument(event) {
        let documentId = event.currentTarget.dataset.id;
        this.documentRecordId = documentId;
        let deleteButton;
        this.template.querySelectorAll(`[data-id="${documentId}"]`).forEach(element => {
            if (element.name === 'deleteButton') {
                deleteButton = element;
                deleteButton.disabled = true;
            }
        });
        this.isLoading = true;
        this.isDelete = true;
        this.isDocumentListOpen = false;
        this.isDeleteDocument = true;
    }

    handleDocumentDeleteConfirm(event) {
        deleteDocument({ documentId: this.documentRecordId })
            .then(() => {
                refreshApex(this.resultRefresh);
                this.dispatchEvent(new CustomEvent("contentdelete"));
                showCustomToast(this, 'Success', 'Record deleted successfully!', 'success');
                this.isLoading = false;
                this.isDeleteDocument = false;
                this.isDocumentListOpen = true;
            })
            .catch(error => {
                if (deleteButton) {
                    deleteButton.disabled = false;
                }
                showError(this, error);
                this.isLoading = false;
            });
    }

    handleCloseDeleteCorpDocConfirmation(event) {
        this.isDeleteDocument = false;
        this.isDocumentListOpen = true;

    }

    handleCloseCorpDocList(event) {
        this.isDocumentListOpen = false;
        this.documentList.records = [];
        this.templateId = undefined;
        this.hasCorpDoc = false;
    }

    handleCloseCorpDoc(event) {
        this.isDocumentOpen = false;
        this.fieldValueMapList = [];
    }

    handleBackCorpDoc(event) {
        this.isDocumentOpen = false;
        this.isEditMode = false;
        this.selectedDocument = {};
        this.fieldValueMapList = [];
        this.isDocumentListOpen = true;
    }

    async handleSelectDocument(event) {
        let selectedDocumentId = event.currentTarget.dataset.id;
        this.selectedDocument = await this.getDocumentContents(selectedDocumentId);
        this.getTemplateContents(this.selectedDocument.templateId);
        this.isDocumentListOpen = false;
        this.isEditMode = false;
        this.isDocumentOpen = true;
    }

    handleEdit(event) {
        this.isEditMode = true;
    }

    handleSave(event) {
        let isAllValid = this.validateFields();
        if (isAllValid) {
            this.isEditMode = false;
            this.updateCorporateDocAndRelatedSections(this.selectedDocument);
            this.fieldValueMapList = [];
        } else {
            showError(this, 'Invalid Field values.');
        }
    }

    handleComposeEmail(event) {
        // if (this.recordId !== null) {
        //     this.isLoading = true;
        composeEmailData({ recordId: this.recordId })
            .then(resp => {
                this.isLoading = false;
                let emailWrapper = resp;
                let tempEmailTemp = [];
                for (let i = 0; i < emailWrapper.listOfEmailTemplateNames.length; i++) {
                    tempEmailTemp.push({ label: emailWrapper.listOfEmailTemplateNames[i], value: emailWrapper.listOfEmailTemplateNames[i] });
                }
                this.emailTemplateNames = tempEmailTemp;
                this.toAddress = '';
                if (emailWrapper.listOfToAddress.length !== 0) {
                    for (let i = 0; i < emailWrapper.listOfToAddress.length; i++) {
                        if (i === emailWrapper.listOfToAddress.length - 1) {
                            this.toAddress = this.toAddress + emailWrapper.listOfToAddress[i];
                        } else {
                            this.toAddress = this.toAddress + emailWrapper.listOfToAddress[i] + ',';
                        }
                    }
                }
                this.emailSubject = '';
                this.emailMessage = '';
                //this.toAddress = '';
                this.ccAddress = '';
                this.bccAddress = '';
                this.isDocumentListOpen = false;
                this.isDocumentOpen = false;
                this.isComposeEmailOpen = true;
            }).catch(error => {
                this.isLoading = false;
                showError(this, error);
            });
        //  }

    }

    handleEmailTemplateChange(event) {
        this.isLoading = true;
        renderEmailBody({ emailTemplateName: event.target.value, recordId: this.recordId })
            .then(resp => {

                this.isLoading = false;
                let listOfEmailData = resp;
                // console.log(JSON.stringify(listOfEmailData[0]));
                // console.log(JSON.stringify(listOfEmailData[1]));
                // console.log("this.emailSubject is : " + JSON.stringify(this.emailSubject));
                // console.log("list of email data is : " + JSON.stringify(listOfEmailData));
                this.emailSubject = listOfEmailData[0];
                this.emailMessage = listOfEmailData[1];
                console.log("this.emailSubject");
                console.log(this.emailSubject);
                console.log("email subject");
                console.log(this.emailMessage)

            }).catch(error => {
                this.isLoading = false;
                showError(this, error);
            });
    }

    handleAttachasPDF(event) {
        this.isLoading = true;
        saveAsPDFAttachment({
            recordId: this.recordId,
            documentId: this.selectedDocument.id,
            documentName: this.templateName
        })
            .then(resp => {
                this.isLoading = false;
                showCustomToast(this, 'Success', 'Document Attached Successfully!', 'success');
            }).catch(error => {
                this.isLoading = false;
                showError(this, error);
            });
    }

    handleSendEmail(event) {
        console.log("email subject is : " + this.emailSubject);
        console.log("email message is :" + this.emailMessage);
        let toEmails = this.toAddress;
        let otherEmails = '';
        this.ccAddress = this.ccAddress.trim();
        this.bccAddress = this.bccAddress.trim();
        if (this.ccAddress && this.ccAddress != '') otherEmails += this.ccAddress;
        if (this.bccAddress && this.ccAddress && this.ccAddress != '' && this.bccAddress != '') {
            otherEmails += ',' + this.bccAddress;
        } else {
            otherEmails += this.bccAddress;
        }

        let areToEmailsValid = this.isEmailListValid(toEmails.split(","));
        let areOtherEmailsValid = otherEmails ? this.isEmailListValid(otherEmails.split(",")) : true;
        let finalMsgValue = this.emailMessage
            .split('<p>').join('')
            .split('<br>').join('')
            .split('</\p>').join('').trim();
        console.log("finalMsgValue is " + this.finalMsgValue);
        if (areToEmailsValid && areOtherEmailsValid && finalMsgValue != '' && this.emailSubject.trim()) {
            sendEmailWithAttachedDocument({
                toAddresses: this.toAddress, emailSubject: this.emailSubject,
                ccAddresses: this.ccAddress, bccAddresses: this.bccAddress,
                emailbody: this.emailMessage, documentName: this.templateName, corpDocId: this.selectedDocument.id
            })
                .then(resp => {
                    this.isComposeEmailOpen = false;
                    this.bccAddress = undefined;
                    showCustomToast(this, 'Success', 'Corporate Document Sent!', 'success');
                })
                .catch(error => {
                    showError(this, error);
                });
        } else if (!areToEmailsValid) {
            showError(this, 'Invalid/Blank To email address(es).');
        } else if (!areOtherEmailsValid) {
            showError(this, 'Invalid Cc/Bcc email address(es).');
        } else {
            showError(this, 'Email subject or message is blank.');
        }
    }

    handleCloseEmailpopup(event) {
        this.isComposeEmailOpen = false;
    }

    handleBackEmailpopup(event) {
        this.isDocumentOpen = true;
        this.isComposeEmailOpen = false;
    }

    handleApproverNameChange(event) {
        this.approverName = event.target.value;
    }
    handleApproverEmailChange(event) {
        this.approverEmail = event.target.value;
    }
    handleOpenDocumentEsign() {
        this.isDocumentEsignOpen = true;
        this.isDocumentOpen = false;
    }
    handleCloseDocumentEsign() {
        this.isDocumentEsignOpen = false;
    }
    handleBackDocumentEsign() {
        this.isDocumentEsignOpen = false;
        this.isDocumentOpen = true;
    }
    handleSendForEsign() {
        if (this.approverName && this.approverEmail) {
            this.isDocumentEsignLoading = true;
            saveDocumentAndSendForEsign({
                recordId: this.recordId,
                documentId: this.selectedDocument.id,
                documentName: this.templateName,
                serviceName: this.serviceName,
                approverName: this.approverName,
                approverEmail: this.approverEmail
            })
                .then(resp => {
                    this.isDocumentEsignLoading = false;
                    this.isDocumentEsignOpen = false;
                    showCustomToast(this, 'Success', 'Document Sent for E-Sign!', 'success');
                }).catch(error => {
                    this.isDocumentEsignLoading = false;
                    showError(this, error);
                });
        } else {
            showError(this, 'Please fill out required field(s).');
        }
    }

    handleFieldValueChange(event) {
        let tempContents = [...this.selectedDocument.sections];
        let tempMainContent = [...this.templateContent];
        let section = tempContents.find(ele => ele.id === event.detail.sectionId);
        let tempSection;
        tempMainContent.forEach(function (item) {
            if (item.docId === event.detail.sectionId) {
                tempSection = item.content;
            }
        });

        let placeholder = this.metadataRecord[START_IDENTIFIER.fieldApiName] + event.detail.placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];

        let fieldKey = event.detail.sectionId + placeholder;
        // if fieldValueMapList array is not empty
        if (this.fieldValueMapList && this.fieldValueMapList.length) {
            let fieldValueMap = this.fieldValueMapList.find(ele => ele.key === fieldKey);
            if (fieldValueMap && !event.detail.value) {
                fieldValueMap.value = '';
            } else if (fieldValueMap && event.detail.value) {
                fieldValueMap.value = event.detail.value;
            } else if (event.detail.value) {
                this.fieldValueMapList.push({ key: fieldKey, placeholder: placeholder, value: event.detail.value });
            }
        } else {    //if fieldValueMapList array is empty then push first element
            this.fieldValueMapList.push({ key: fieldKey, placeholder: placeholder, value: event.detail.value });
        }

        let tempSectionContent;
        let matchCount = 0;
        for (let i in this.fieldValueMapList) {
            if (this.fieldValueMapList[i].key.includes(event.detail.sectionId)) {
                if (++matchCount == 1) {
                    tempSectionContent = tempSection.split(this.fieldValueMapList[i].placeholder).join(this.fieldValueMapList[i].value);
                } else {
                    tempSectionContent = tempSectionContent.split(this.fieldValueMapList[i].placeholder).join(this.fieldValueMapList[i].value);
                }
            }
        }
        section.content = tempSectionContent;
    }

    handleViewAsPDF(event) {
        if (this.selectedDocument) {
            if (this.namespacePrefix) {
                console.log('namespace1:' + this.namespacePrefix);
                window.open('/apex/' + this.namespacePrefix + '__ViewPDF?id=' + this.selectedDocument.id, '_blank');
            } else {
                window.open('/apex/ViewPDF?id=' + this.selectedDocument.id, '_blank');
            }
        }
    }
    //Added for docType dropdown
    get docTypeOptions() {
        return [
            { label: 'PDF', value: 'Pdf' },
            { label: 'Word', value: 'Word' },
            { label: 'Excel', value: 'Excel' },
        ];
    }

    handleDocTypeChange(event) {
        this.docType = event.detail.value;
    }


    handleViewAsDoc(event) {

        if (this.selectedDocument) {

            let vfPageName = 'ViewDOC';
            let docType = 'pdf';

            if (this.docType == 'Pdf')
                docType = 'pdf';
            else if (this.docType == 'Word')
                docType = 'word';
            else if (this.docType == 'Excel')
                docType = 'excel';

            if (this.namespacePrefix) {
                window.open('/apex/' + this.namespacePrefix + '__' + vfPageName + '?id=' + this.selectedDocument.id + '&viewas=' + docType, '_blank');
            } else {
                window.open('/apex/' + vfPageName + '?id=' + this.selectedDocument.id + '&viewas=' + vfPageName, '_blank');
            }
        }
    }
    handleToAddressChange(event) {
        this.toAddress = event.target.value;
    }
    handleCCAddressChange(event) {
        this.ccAddress = event.target.value;
    }
    handleBccAddressChange(event) {
        this.bccAddress = event.target.value;
    }
    handleSubjectChange(event) {
        this.emailSubject = event.target.value || this.emailSubject;
    }
    handleMessageChange(event) {
        this.emailMessage = event.target.value || this.emailMessage;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    /** Wired apex calls */
    @wire(getDocumentList, { formId: '$templateId', relatedRecordId: '$relatedRecordId', pageNumber: '$pageNumber', pageSize: '$pageSize' })
    wiredDocumentList(result) {
        this.resultRefresh = result;
        console.log('OUTPUT result data is  : ');
        console.log(result.data);
        if (result.data) {
            this.documentList = JSON.parse(JSON.stringify(result.data));
            this.hasCorpDoc = true;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            showError(this, this.error);
        }
    }

    @wire(getDocumentTemplate, { templateId: '$templateId' })
    wiredDocumentTemplate({ data, error }) {
        if (data) {
            this.templateName = data.name;
            this.allowAttachAsPDF = data.allowAttachAsPDF;
            this.allowSendAsEmailAttachment = data.allowSendAsEmailAttachment;
            this.allowEsign = data.allowEsign;
            if (data.additionalInfoJSON) {
                this.additionalInfoJSON = JSON.parse(data.additionalInfoJSON);
                let refFieldsArray = [];
                refFieldsArray.push(this.additionalInfoJSON.approverNameRef);
                refFieldsArray.push(this.additionalInfoJSON.approverEmailRef);
                this.refFields = [...refFieldsArray];
            }
        } else if (error) {
            this.error = error;
            showError(this, this.error, 'wiredDocumentTemplate');
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$refFields' })
    wiredRecords({ data, error }) {
        if (data && data.fields) {
            this.approverName = data.fields[this.additionalInfoJSON.approverNameRef.split('.')[1]].value;
            this.approverEmail = data.fields[this.additionalInfoJSON.approverEmailRef.split('.')[1]].value;
        } else if (error) {
            showError(this, error);
        }
    }

    /**Imperative apex calls */
    getTemplateContents(documentTemplateId) {
        getFormContentList({ formId: documentTemplateId })
            .then(data => {
                this.templateContent = JSON.parse(JSON.stringify(data));
                for (let i in data) {
                    let section = this.selectedDocument.sections.find(ele => ele.orderSequence === data[i].orderSequence);
                    this.templateContent[i].docId = section.id;
                }
                if (Array.isArray(this.templateContent) && this.templateContent.length
                    && this.selectedDocument && this.selectedDocument.sections.length) {
                    this.initializeFieldValueMapList();
                    //logic to add PlaceHolder value to templateContent
                    for (let i in this.templateContent) {
                        let Fields = this.templateContent[i].fields;
                        if (Array.isArray(this.templateContent[i].fields) && this.templateContent[i].fields.length > 0) {
                            for (let k = 0, p = this.templateContent[i].fields.length; k < p; k++) {
                                var keys = Object.keys(this.templateContent[i].fields[k]);
                                var templateContentPlaceholderContent = this.templateContent[i].fields[k].placeholderContent;
                                for (let m = 0, v = this.fieldValueMapList.length; m < v; m++) {
                                    var newtemplateContentPlaceholdervalue = this.metadataRecord[START_IDENTIFIER.fieldApiName] + this.templateContent[i].fields[k].placeholderContent + this.metadataRecord[END_IDENTIFIER.fieldApiName];
                                    if (newtemplateContentPlaceholdervalue === this.fieldValueMapList[m].placeholder) {
                                        this.templateContent[i].fields[k].value = this.fieldValueMapList[m].value;
                                    }
                                }
                            }
                        }
                    }
                }
            })
            .catch(error => {
                showError(this, error, 'getFormContentList');
            });
    }

    async getDocumentContents(selectedDocumentId) {
        let selectedDocument = {};
        try {
            selectedDocument = await getDocumentById({ documentId: selectedDocumentId });
        }
        catch (error) {
            showError(this, error, 'getDocumentById');
        }
        return selectedDocument;
    }

    /** api exposed methods */
    @api refreshApexFromParent() {
        return refreshApex(this.resultRefresh);
    }

    /** Other util methods */
    updateCorporateDocAndRelatedSections(corpDocument) {
        const fields = {};
        fields[CORPDOC_ID_FIELD.fieldApiName] = corpDocument.id;
        fields[VERSION_FIELD.fieldApiName] = 'V4';
        fields[TEMPLATEID_FIELD.fieldApiName] = corpDocument.templateId;
        fields[STAGE_FIELD.fieldApiName] = 'Draft';
        const recordInput = { fields: fields };
        updateRecord(recordInput)
            .then(corpDoc => {
                this.corpDocId = corpDoc.id;
                this.isDocumentOpen = false;
                let sections = corpDocument.sections;
                let sectionList = [];
                for (let i in sections) {
                    let sectionContent = {};
                    sectionContent[DOC_ID_FIELD.fieldApiName] = sections[i].id;
                    sectionContent[DOC_NAME_FIELD.fieldApiName] = sections[i].name;
                    sectionContent[ORDER_SEQUENCE_FIELD.fieldApiName] = sections[i].orderSequence;
                    sectionContent[SECTION_CONTENT_FIELD.fieldApiName] = sections[i].content;
                    sectionContent[CORPORATE_DOC_FIELD.fieldApiName] = this.corpDocId;
                    sectionList.push(sectionContent);
                }
                upsertDocContentList({ docContentList: sectionList })
                    .then(resp => {
                        showCustomToast(this, 'Success', 'Record updated successfully!', 'success');
                    }).catch(error => {
                        showError(this, error);
                    });
            })
            .catch(error => {
                showError(this, error);
            });
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

    initializeFieldValueMapList() {
        for (let i in this.selectedDocument.sections) {
            let documentSection = this.selectedDocument.sections[i];
            let templateSection = this.templateContent.find(ele => ele.docId === documentSection.id);
            let kvList = [];
            if (templateSection && templateSection.content && documentSection && documentSection.content) {
                kvList = this.getKeyValuePairList(JSON.stringify(templateSection.content), JSON.stringify(documentSection.content));
            }

            for (let j in kvList) {
                this.fieldValueMapList = [...this.fieldValueMapList, Object.assign({}, { key: documentSection.id + kvList[j].placeholder }, kvList[j])];
            }
        }
    }

    getKeyValuePairList(s1, s2) {
        let validParam = false;
        let startPosition;
        let endPosition;
        let nextStartPosition;
        let placeholder;
        let stringAfterPlaceholder;
        let content;
        let j;
        let kvList = [];
        let isLastParam;	//special condition for last parameter
        for (let i = 0; i < s1.length; i++) {
            //mark beginning of placeholder
            if (s1.charAt(i) == "[") {
                validParam = true;
                startPosition = i;
            }
            //mark end of placeholder
            if (s1.charAt(i) == this.metadataRecord[END_IDENTIFIER.fieldApiName] && validParam) {
                endPosition = i;
                isLastParam = true;
                placeholder = s1.substring(startPosition, endPosition + 1);
                //Find the next occurrence of '['
                nextStartPosition = 0;
                for (let k = i + 1; k < s1.length; k++) {
                    if (s1.charAt(k) == "[") {
                        nextStartPosition = k;
                        break;
                    }
                }
                // If next occurrence of '[' is not there
                if (nextStartPosition === 0) {
                    stringAfterPlaceholder = s1.substring(i + 1, i + 4);
                }
                //Special case: If two placeholders occurring side by side
                //without any character in between. i.e, [FirstName][LastName]
                else if ((nextStartPosition - endPosition) === 1) {
                    //Skip that iteration
                    continue;
                }
                // >=5 can be greater, it depend on how much accuracy we want
                else if ((nextStartPosition - endPosition) >= 5) {
                    stringAfterPlaceholder = s1.substring(i + 1, i + 5);
                } else {
                    stringAfterPlaceholder = s1.substring(i + 1, i + (nextStartPosition - endPosition));
                }
                content = "";
                //Find existing entry in kvList with same placeholder if any
                let existingEntry = kvList.find(ele => ele.placeholder === placeholder);
                for (j = startPosition; j < s2.length; j++) {
                    content = content + s2.charAt(j);
                    if (stringAfterPlaceholder != "" && content.includes(stringAfterPlaceholder)) {
                        content = content.substring(0, (content.length - stringAfterPlaceholder.length));
                        s1 = s1.substring(i + 1, s1.length).trim();
                        s2 = s2.substring(j - stringAfterPlaceholder.length + 1, s2.length).trim();

                        //so each sub string count start with zero
                        //and i will be incremented to 0(zero) in next iteration							
                        i = -1;
                        // If new and unique entry and content is not equal to placeholder
                        // then only add to the list
                        if (!existingEntry && placeholder !== content) {
                            kvList = [...kvList, { placeholder: placeholder, value: content }];
                        }
                        validParam = false;
                        isLastParam = false;
                        break;
                    }
                    if (isLastParam && j == s2.length - 1) {
                        content = s2.substring(startPosition, s2.length - stringAfterPlaceholder.length);
                        if (!existingEntry && placeholder !== content) {
                            kvList = [...kvList, { placeholder: placeholder, value: content }];
                        }
                    }
                }
            }
        }
        return kvList;
    }

    isEmailListValid(emailList) {
        let areEmailsValid = false;
        let noOfValidEmails = 0;
        let regexEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        for (let i in emailList) {
            if (emailList[i] && emailList[i].match(regexEmailformat)) {
                noOfValidEmails++;
            }
        }
        if (noOfValidEmails === emailList.length) {
            areEmailsValid = true;
        } else {
            areEmailsValid = false;
        }
        return areEmailsValid;
    }
}