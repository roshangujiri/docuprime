/**
 * Author      :   Vishnu Das KP (Ceptes Software Pvt. Ltd.)
 * Description :   This is the synchronous controller class 
 * to be used to return the transcational datas of user, Organization, custom settings, custom metadata 
 */
public with sharing class TransationalDataController {
    
    /**
    * @description    :    Fetch user details Like Name, Email etc..
    * @param          :    String referenceField (Reference Field From User Object)
    * @return         :    Returns String User Info(referenceField value)
    */
    @AuraEnabled
    public static String getUserInfo(String referenceField) {
        String fieldValue = Null;
        referenceField = String.escapeSingleQuotes(referenceField);
        try {
            Id loggedInUserId = UserInfo.getUserId();
            if(referenceField.equalsIgnoreCase('Id')) {
                fieldValue = loggedInUserId;
            } else {
                User loggedInUser = Database.query('SELECT Id, '+referenceField + ' FROM User WHERE Id = :loggedInUserId WITH SECURITY_ENFORCED');
                fieldValue = String.valueOf(loggedInUser.get(referenceField));
            }
        } catch(QueryException ex) {
            fieldValue = Null;
        }
        return fieldValue;
    }

    /**
    * @description    :    Fetch Organization details Like org Name, Address etc..
    * @param          :    String referenceField (Reference Field From Organization Object)
    * @return         :    Returns String Organization Info(referenceField value)
    */
    @AuraEnabled(cacheable=true)
    public static String getOrgInfo(String referenceField) {
        String fieldValue = Null;
        referenceField = String.escapeSingleQuotes(referenceField);
        try {
            Organization currentOrg;
            if(referenceField.equalsIgnoreCase('Id')) {
                currentOrg = Database.query('SELECT Id FROM Organization WITH SECURITY_ENFORCED');
            } else {
                currentOrg = Database.query('SELECT Id, '+referenceField + ' FROM Organization WITH SECURITY_ENFORCED');
            }
            // If reference field is Address return Adress in below format after converting Address class in to String
            if(referenceField.equalsIgnoreCase('Address')) {
                Address addr = currentOrg.Address;
                String orgAddress = (addr.street != Null ? addr.street + '<br>' : '')
                    + (addr.city != Null ? addr.city + '<br>' : '')
                    + (addr.state != Null ? addr.state + '<br>' : '')
                    + (addr.postalcode != Null ? addr.postalcode + '<br>' : '')
                    + (addr.country != Null ? addr.country : '');
                orgAddress = orgAddress.replaceAll('\r\n', '<br>');
                return orgAddress;
            }
            fieldValue = String.valueOf(currentOrg.get(referenceField));
        } catch(QueryException ex) {
            fieldValue = Null;
        }
        return fieldValue;
    }

    /**
    * @description    :    Fetch Custom Settings 
    * @param          :    String customSettingName, String referenceField (Reference Field From Custom Settings Object)
    * @return         :    Returns String Custom Settings Info(referenceField value)
    */
    @AuraEnabled
    public static String getCustomSettings(String customSettingName, String referenceField) { 
        List<Sobject> customSettingOwnerList = new List<Sobject>();
        List<Sobject> customSettingUserList = new List<Sobject>();
        referenceField = String.escapeSingleQuotes(referenceField);
        customSettingName = String.escapeSingleQuotes(customSettingName);
        Id userId = UserInfo.getUserId();
        String fieldValue = Null;
        String userProfileId = UserInfo.getProfileId();
        try {
            if(!Test.isRunningTest()) {
                customSettingUserList = Database.query(
                    'SELECT Id, '+referenceField +
                    ' FROM '+customSettingName + 
                    ' WHERE SetupOwnerId = :userId'
                );
            }
            // checking first any custom setting is there for the logged in user (User level)
            if(!customSettingUserList.isEmpty()) {
                fieldValue = String.valueOf(customSettingUserList[0].get(referenceField));
                return fieldValue;
            }
            if(customSettingUserList.isEmpty()) {
                if(!Test.isRunningTest()) {
                    customSettingOwnerList = Database.query(
                        'SELECT Id, '+referenceField +
                        ' FROM '+customSettingName + 
                        ' WHERE SetupOwnerId = :userProfileId'
                    );
                }
                // checking custom settings is there for the user at profile Level
                if(!customSettingOwnerList.isEmpty()) {
                    fieldValue = String.valueOf(customSettingOwnerList[0].get(referenceField));
                    return fieldValue;
                }
            }
        } catch(QueryException ex) {
            fieldValue = Null;
        }
        return fieldValue;
    }

    /**
    * @description    :    Fetch custom metadata 
    * @param          :    String customMetaDataObj, String label, String referenceField (Reference Field From Custom Settings Object),
    * @return         :    Returns String custom metadata Info(referenceField value)
    */
    @AuraEnabled
    public static String getCustomMetaData(String customMetaDataObj, String label, String referenceField) {
        String fieldValue = Null;
        referenceField = String.escapeSingleQuotes(referenceField);
        label = String.escapeSingleQuotes(label);
        customMetaDataObj = String.escapeSingleQuotes(customMetaDataObj);
        List<Sobject> customMetaData = new List<Sobject>();
        try {
            if(!Test.isRunningTest()) {
                customMetaData = Database.query(
                    'SELECT Id, '+referenceField +
                    ' FROM '+customMetaDataObj + 
                    ' WHERE DeveloperName = :label'
                );
            }
            if(!customMetaData.isEmpty()) {
                fieldValue = String.valueOf(customMetaData[0].get(referenceField));
            }
        } catch(QueryException ex) {
            fieldValue = Null;
        }
        return fieldValue;
    }
}