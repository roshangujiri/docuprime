import {
  LightningElement,
  track,
  wire,
  api
} from 'lwc';

import findRecords from "@salesforce/apex/LookupSearchController.findRecords";

export default class CustomLookupSearch extends LightningElement {
  @track recordsList;
  @track message;
  @api selectedValue;
  @api selectedRecordId;
  @api objectApiName;
  @api iconName;
  @api lookupLabel;
  @api fieldKey;
  @api fieldLabel;
  @api isdisabled = false;
  @api isrequired;
  showErrorMessage = false;
  inputClass = 'slds-input slds-combobox__input slds-combobox__input-value';

  connectedCallback() {
    if (this.selectedValue === undefined) {
      this.selectedValue = ""
    }
    if (this.isrequired == 'true') {
      this.isrequired = true;
    } else if (this.isrequired == 'false') {
      this.isrequired = false;
    } else {
      this.isrequired = false;
    }
    setTimeout(function () {
      this.checkErrorMessage();
    }, 2000);
  }
  @api
  checkErrorMessage() {
    if (this.isrequired === true && this.selectedValue) {
      this.showErrorMessage = false;
      this.inputClass = 'slds-input slds-combobox__input slds-combobox__input-value';
    } else if (this.isrequired === false) {
      this.showErrorMessage = false;
      this.inputClass = 'slds-input slds-combobox__input slds-combobox__input-value';
    } else {
      this.showErrorMessage = true;
      this.inputClass = 'slds-has-error slds-input slds-combobox__input slds-combobox__input-value';
    }
  }

  /*Handler methods*/

  onRecordSelection(event) {
    this.selectedRecordId = event.target.dataset.key;
    //Set the selected value on record selection
    if (this.objectApiName !== 'NonSetupObjects' && !this.objectApiName.includes('-getChild')) {
      this.selectedValue = this.objectApiName + '.' + event.target.dataset.name;
    } else {
      this.selectedValue = event.target.dataset.name;
    }
    this.handleCopy();
  }

  //Set the search data
  handleKeyChange(event) {
    const searchKey = event.target.value;
    console.log('SearchKeyValues:' + searchKey);
    this.selectedValue = searchKey;
    this.getLookupResult();
    this.checkErrorMessage();
    this.handleCopy();
    const passEvent = new CustomEvent('recordchange', {
      detail: {
        selectedRecordId: this.fieldKey,
        selectedValue: this.selectedValue,
        selectedLabel: this.fieldLabel
      }
    });
    this.dispatchEvent(passEvent);

  }

  //Blank the input text on close button click
  removeRecordOnLookup(event) {
    this.selectedValue = null;
    this.selectedRecordId = null;
    this.recordsList = null;
    this.checkErrorMessage();
    this.handleCopy();
    const passEvent = new CustomEvent('remove', {
      detail: {
        selectedRecordId: this.fieldKey
      }
    });
    this.dispatchEvent(passEvent);
  }

  getLookupResult() {
    //Get the records from server
    findRecords({
      searchKey: this.selectedValue,
      objectName: this.objectApiName
    })
      .then((result) => {
        if (result.length === 0) {
          this.recordsList = [];
          this.message = "No Records Found";
        } else {
          this.recordsList = result;
          this.message = "";
        }
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.recordsList = undefined;
      });
  }

  handleCopy(event) {
    //Send selected data to the parent component
    const passEvent = new CustomEvent('recordselection', {
      detail: {
        selectedRecordId: this.fieldKey,
        selectedValue: this.selectedValue,
        selectedLabel: this.fieldLabel
      }
    });
    this.dispatchEvent(passEvent);
    this.selectedRecordId = null;
    this.recordsList = null;
  }
}