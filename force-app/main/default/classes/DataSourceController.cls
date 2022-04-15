public with sharing class DataSourceController {

    @AuraEnabled
    public static List<Object> FetchDataSource(String doucumentTemplateId ){
      //  List<Object> listOfDataSources = new List<Object>();
        List<Document_Template__c> listOFDocumentTemplate = [SELECT Id, Name,Parent_Object_Name__c,Template_External_Id__c, (SELECT Id, Name, Order__c,Handler_Name__c,Type__c, Document_Template__c, Active__c,Description__c,Inputs__c FROM Data_Sources__r ORDER BY Order__c ASC) FROM Document_Template__c WHERE Document_Template__c.Id = :doucumentTemplateId ];
       // List<PackageLicense> listOfPackages =[SELECT Id, NamespacePrefix FROM PackageLicense];
         // System.debug('listOfPackages'+listOfPackages);
         // listOfDataSources.add(listOFDocumentTemplate);
         // listOfDataSources.add(listOfPackages);
          //system.debug('listOfDataSources'+listOfDataSources);
          return listOFDocumentTemplate; 
    }
    @AuraEnabled
    public static List<Data_Sources__c> SaveDataSource (String dataSource) {
        List<Data_Sources__c> dataSourceList  = (List<Data_Sources__c>) JSON.deserialize(dataSource, List<Data_Sources__c>.class);
       // List<Data_Sources__c> dataSourceList  = (List<Data_Sources__c>) JSON.deserializeUntyped(dataSource);
        UPSERT dataSourceList;
        return dataSourceList;
    }
    @AuraEnabled
      public static void deleteDataSources (String strId, String updatedArr) {
          System.debug('strId'+strId);
          System.debug('updatedArr'+updatedArr);
          SObject obj = [SELECT Id From Data_Sources__c Where Id=:strId];
          delete obj;
          System.debug('--=-- inside the update data --=--');
          List<Data_Sources__c> dataSourceList  = (List<Data_Sources__c>) JSON.deserialize(updatedArr, List<Data_Sources__c>.class);
          System.debug('--=-- inside the update data after --=--');
          UPDATE dataSourceList;
    }   
    @AuraEnabled 
      public static List<SObject> getIntegrationChannel (String searchKey){
        String keyString ='%'+ searchKey + '%';
        return [
            SELECT lwapic__Channel_Name__c, Id FROM lwapic__Integration_Channel__c WHERE lwapic__Channel_Name__c like:keyString
            ];
    }
    @AuraEnabled
    public static List<SObject> getAllApexClasses(String searchKey){
        String keyString ='%'+ searchKey + '%';
        return[SELECT Name FROM ApexClass WHERE Name like:keyString];
    }
        @AuraEnabled
    public static List<SObject> queryMetadata(String serviceName ){
        String query ='SELECT Id,QualifiedApiName, Carbone_url__c, Method__c, Carbone_Version__c, Authorization_Token__c FROM Carbone_Info__mdt WHERE QualifiedApiName='+'\''+ serviceName + '\'';
        List<SObject> lstRecords = Database.query(query);
        System.debug('lstRecords = '+lstRecords);
        return lstRecords;
    }
}