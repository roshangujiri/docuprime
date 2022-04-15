import { LightningElement, api, track } from 'lwc';
import getResults from '@salesforce/apex/LookupSearchController.getResults';
export default class MultiselectFieldController extends LightningElement {
    @api objectName;
    @track selectedRecords = [];
    @track searchRecords = [];
    @track dynamiClassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    searchField(event) {
        var currentText = event.target.value;
        getResults({ ObjectName: this.objectName, value: currentText })
            .then(result => {
                console.log('--result is --=--' + JSON.stringify(result));
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
}