/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class ICChannelRequest {
    @InvocableVariable(label='Integration Channel Name' description='Integration Channel Name' required=true)
    global String channelName;
    @AuraEnabled
    @InvocableVariable(label='Check Only' description='Check Only will not allow real-time DML' required=false)
    global Boolean checkOnly;
    @InvocableVariable(label='Enable Logging' description='Enable Logging' required=false)
    global Boolean enableLogging;
    @AuraEnabled
    @InvocableVariable(label='Execute Client Side' description='Is the call coming from LWC component' required=false)
    global Boolean executeClientSide;
    @InvocableVariable(label='Execute Response Only' description='Execute Response Only' required=false)
    global Boolean executeResponseOnly;
    @AuraEnabled
    @InvocableVariable(label='Log Type' description='Logs' required=false)
    global String logType;
    @InvocableVariable(label='Notification Type' description='Notification Type' required=false)
    global String notificationType;
    @InvocableVariable(label='Query Params' description='Request Data' required=false)
    global String queryParams;
    @InvocableVariable(label='Record Id' description='Record Id' required=false)
    global String recordId;
    @InvocableVariable(label='Request Payload' description='Request Payload' required=false)
    global String requestPayload;
    @AuraEnabled
    @InvocableVariable(label='Response Body' description='Response Body' required=false)
    global String responseBody;
    @AuraEnabled
    @InvocableVariable(label='Response Header Map' description='Response Header Map' required=false)
    global String responseHeaderMap;
    global ICChannelRequest() {

    }
}
