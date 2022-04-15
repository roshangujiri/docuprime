import { LightningElement, track, wire, api } from 'lwc';
import fetchSectionsAndTemplateDetails from "@salesforce/apex/LookupController.fetchSectionsAndTemplateDetails";
export default class CustomLookupSearch extends LightningElement {
  @track recordsList;
  @track searchKey = "";
  @api selectedValue;
  @api selectedRecordId;
  @api objectApiName;
  @api iconName;
  @api lookupLabel;
  @track message;

  onLeave(event) {
    setTimeout(() => {
      this.searchKey = "";
      this.recordsList = null;
    }, 300);
  }

  onRecordSelection(event) {
    this.selectedRecordId = event.target.dataset.key;
    this.selectedValue = event.target.dataset.name;
    this.searchKey = "";
    this.handleCopy();

  }

  handleKeyChange(event) {
    const searchKey = event.target.value;
    console.log('searchkey Value:'+searchKey);
    this.searchKey = searchKey;
    if(this.searchKey==="")
    {
      this.searchKey=null;
    }
    //console.log('Look up execute before:'+this.searchKey);
    this.getLookupResult();
    //console.log('Look up execute after:'+this.searchKey);
  }

  removeRecordOnLookup(event) {
    this.searchKey = "";
    this.selectedValue = null;
    this.selectedRecordId = null;
    this.recordsList = null;
    this.onSeletedRecordUpdate();
  }

  getLookupResult() {
    //console.log('Search Key1:'+this.searchKey);
    fetchSectionsAndTemplateDetails({ searchKey: this.searchKey, objectName: this.objectApiName })
    
      .then((result) => {
        if (result.length === 0 && (this.searchKey == null) ) {
          this.recordsList = '';
          this.message = '';
        } else if((result.length === 0) && (this.searchKey != null) && (this.searchKey.length >= 3)) {
          this.recordsList = [];
          this.message = "No Records Found In The List";
        }
        else if ( (result.length !== 0) && (this.searchKey !== null) && (this.searchKey.length >= 3 )) {
          this.recordsList = result;
          this.message = "";
        }
        else{
          this.recordsList = '';
          this.message = "Not Applicable";
        }
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.recordsList = undefined;
      });
  }

  handleCopy(event) {
    this.searchKey = "";
    const passEvent = new CustomEvent('recordselection', {
      detail: { selectedRecordId: this.selectedRecordId, selectedValue: this.selectedValue }
    });
    this.dispatchEvent(passEvent);
    this.searchKey = "";
    this.selectedValue = null;
    this.selectedRecordId = null;
    this.recordsList = null;

  }
}