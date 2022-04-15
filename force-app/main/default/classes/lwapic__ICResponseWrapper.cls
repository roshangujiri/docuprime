/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class ICResponseWrapper {
    @AuraEnabled
    @InvocableVariable( required=false)
    global String callBackUrl;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String channelId;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String jobId;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String objectName;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String recordId;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestBody;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestDataType;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestHeader;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestMapping;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestMethod;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestSeparator;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String requestURL;
    global System.HttpResponse response;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String responseBody;
    @AuraEnabled
    global Blob responseBodyAsBlob;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String responseDataType;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String responseHandlerName;
    global Map<String,Object> responseHeaderMap;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String responseMapping;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String responseSeparator;
    @AuraEnabled
    @InvocableVariable( required=false)
    global String responseType;
    global ICResponseWrapper() {

    }
}
