global inherited sharing class PlaceholderValueWrapper {
    @AuraEnabled public String placeholder {get; set;}
    @AuraEnabled public String value {get; set;}
    global PlaceholderValueWrapper(String placeholder, String value) {
        this.placeholder = placeholder;
        this.value = value;
    }
}