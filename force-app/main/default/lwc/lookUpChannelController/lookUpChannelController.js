import { LightningElement, track, api } from 'lwc';
import getChannel from '@salesforce/apex/DataSourceController.getIntegrationChannel'
export default class LookUpChannelController extends LightningElement {
    @api selectedValue;
    @api lookupLabel;
    @track message = ''
    showErrorMessage = false;
    recordsList;
    dropdownClass = ''
    inputClass = 'slds-input slds-combobox__input slds-combobox__input-value';
    handleKeyChange(event) {
        this.showErrorMessage = false
        this.message = ''
        const searchKey = event.target.value;
        console.log('SearchKeyValues:' + searchKey);
        this.selectedValue = searchKey;
        if (this.selectedValue.length == 0) {
            this.inputClass = 'slds-has-error slds-input slds-combobox__input slds-combobox__input-value';
            this.showErrorMessage = true;
            this.message = 'Complete this field.'
            this.dispatchEvent(new CustomEvent('change', {
                detail: { channelName: this.selectedValue },
                bubbles: true
            }))
        }
        else {
            this.getLookupResult();
        }

    }
    getLookupResult() {
        if (this.selectedValue.length == 0) {
            this.inputClass = 'slds-has-error slds-input slds-combobox__input slds-combobox__input-value';
            this.showErrorMessage = true;
            this.message = 'Complete this field.'
            this.dropdownClass = ''
        }
        else if (this.selectedValue.length >= 2) {
            getChannel({
                searchKey: this.selectedValue,
            })
                .then((result) => {
                    console.log('--=-- result is --=--' + JSON.stringify(result))
                    console.log(result.length)
                    if (result.length == 0) {
                        this.showErrorMessage = true;
                        this.message = "No Records Found.";
                        this.recordsList = [];
                        this.dropdownClass = 'slds-dropdown slds-dropdown_left slds-dropdown_small slds-dropdown_length-5'

                    } else {
                        this.recordsList = result;
                        this.dropdownClass = 'slds-dropdown slds-dropdown_left slds-dropdown_small slds-dropdown_length-5'
                        this.message = "";
                        this.showErrorMessage = false;
                    }
                })
                .catch((error) => {
                    // this.error = error;
                    this.recordsList = undefined;
                });
        }
        //Get the records from server

    }
    onRecordSelection(event) {
        this.selectedValue = event.target.dataset.name;
        // this.showErrorMessage = true;
        // this.message = "";
        this.inputClass = 'slds-input slds-combobox__input slds-combobox__input-value'
        this.recordsList = [];
        this.dropdownClass = ''

        this.dispatchEvent(new CustomEvent('change', {
            detail: { channelName: this.selectedValue },
            bubbles: true
        }))
    }
    removeRecordOnLookup() {
        this.selectedValue = '';
        this.inputClass = 'slds-has-error slds-input slds-combobox__input slds-combobox__input-value';
        // this.showErrorMessage = true;
        // this.message = 'Complete this field.'
        this.dropdownClass = ''
        this.dispatchEvent(new CustomEvent('change', {
            detail: { channelName: this.selectedValue },
            bubbles: true
        }))

    }
}