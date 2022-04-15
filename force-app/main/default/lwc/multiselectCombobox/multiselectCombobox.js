import { LightningElement, api, track } from 'lwc';

import getResults from '@salesforce/apex/LookupSearchController.getResults';

export default class MultiselectCombobox extends LightningElement {
    @api objectName;
    @api fieldName = '';
    @api singleSelection = false;
    @api sectionId;
    @api sectionLabel;
    @api label;
    @track searchRecords = [];
    @track selectedIds = [];
    @track selectedRecords = [];
    @api selectedFromParent = [];
    @api required = false;
    @api iconName = 'action:new_user'
    @api LoadingText = false;
    @track dynamiClassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;
    @track disableInputField = false;


    connectedCallback() {
        console.log('--=--objectName --=--' + JSON.stringify(this.objectName));
        console.log('--=--sectionId --=--' + JSON.stringify(this.sectionId))

        console.log('--=--selectedFromParent --=--' + JSON.stringify(this.selectedFromParent))

        if (this.selectedFromParent != undefined) {
            let selectedData = [];
            for (var i = 0; i < this.selectedFromParent.length; i++) {
                selectedData.push({ 'recId': this.selectedFromParent[i], 'recName': this.selectedFromParent[i] });
            }
            console.log('in connected call back', this.selectedFromParent);
            this.selectedRecords = [...selectedData];
        }
    }

    /*Handler methods*/

    searchField(event) {
        var currentText = event.target.value;
        var selectRecId = [];
        for (let i = 0; i < this.selectedRecords.length; i++) {
            selectRecId.push(this.selectedRecords[i].recId);
        }
        this.LoadingText = true;
        getResults({ ObjectName: this.objectName, value: currentText, selectedRecId: selectRecId })
            .then(result => {
                if (currentText.length === 0) {
                    this.searchRecords = [];
                } else {
                    this.searchRecords = result;
                }
                this.LoadingText = false;
                this.dynamiClassname = result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
                if (currentText.length > 0 && result.length == 0) {
                    this.messageFlag = true;
                }
                else {
                    this.messageFlag = false;
                }

                if (this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false;
                    this.clearIconFlag = true;
                }
                else {
                    this.iconFlag = true;
                    this.clearIconFlag = false;
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    @api
    getselectedrecordToPopup() {
        return this.selectedRecords;
    }

    @api
    setSelectedrecordFromPopup(fieldName) {

        let newsObject = { 'recId': fieldName, 'recName': fieldName };
        this.selectedIds.push(fieldName);
        this.selectedRecords.push(newsObject);
        this.dynamiClassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.template.querySelectorAll('lightning-input').forEach(each => {
            each.value = '';
        });


    }


    setSelectedRecord(event) {
        console.log('here in setting values');
        var recId = event.currentTarget.dataset.id;
        var selectName = event.currentTarget.dataset.name;
        let newsObject = { 'recId': recId, 'recName': selectName };
        this.selectedIds.push(recId);
        this.selectedRecords.push(newsObject);
        this.dynamiClassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.template.querySelectorAll('lightning-input').forEach(each => {
            each.value = '';
        });
        let ids = this.selectedIds.toString();
        const selectedEvent = new CustomEvent("fieldsselection", {
            detail: { selectedValue: this.selectedRecords, sectionKey: this.sectionId, sectionLabel: this.sectionLabel }
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    removeRecord(event) {
        let selectRecId = this.selectedRecords;
        let selectedIds1 = this.selectedIds;
        let index = event.target.dataset.index;
        // for(let i = 0; i < this.selectedRecords.length; i++){
        //     if(event.detail.name !== this.selectedRecords[i].recId){
        //         selectRecId.push(this.selectedRecords[i]);
        //         selectedIds1.push(this.selectedRecords[i].recId)
        //     }
        // }
        if (index > -1) {
            selectRecId.splice(index, 1);
            selectedIds1.splice(index, 1);
        }
        this.selectedRecords = [...selectRecId];
        this.selectedIds = [...selectedIds1];
        let selRecords = this.selectedRecords;

        let ids = this.selectedIds.toString();
        if (this.singleSelection && selectRecId.length <= 0) {
            this.disableInputField = false;
        }
        const selectedEvent = new CustomEvent('userselected', {
            detail: { selectedValue: this.selectedRecords, sectionKey: this.sectionId, sectionLabel: this.sectionLabel }
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
}