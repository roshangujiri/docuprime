public with sharing class RequestPayloadGenerator {
    
    public static List<SObject> retrieveDataSources(String documentTemplate) {
        
        List<Data_Sources__c> dataSourceList = 
            [
                SELECT 
                    Id, 
                    Name,
                    Order__c, 
                    Handler_Name__c,
                    Description__c, 
                    Active__c, 
                    Inputs__c, 
                    Document_Template__c, 
                    Type__c
                    FROM 
                    Data_Sources__c 
                
                WHERE 
               	 	Document_Template__c = :documentTemplate
                
                ORDER BY 
                	Order__c ASC 
                
            ];
        
        System.debug('dataSourceList = '+dataSourceList);
        return dataSourceList;
    }
    
        
    public static List<SObject> retrieveDocumentTemplate(String documentTemplate ,String recordId) {
        
        List<Document_Template__c> dataSourceList = 
            [
                SELECT 
                    Id, 
                    Parent_Object_Name__c 
                
                FROM 
                    Document_Template__c 
                
                WHERE 
                	Id =: documentTemplate  
            ];
        
        List<String> queryParamList = new List<String>();
        String queryString = String.isBlank(recordId)?'SELECT FIELDS(STANDARD) FROM {0} LIMIT 10' : 'SELECT FIELDS(STANDARD) FROM {0} WHERE Id =:recordId' ;
        
        System.debug('queryString = '+queryString);
        
        queryParamList.add(String.valueOf(dataSourceList.get(0).get('Parent_Object_Name__c')));
        queryParamList.add(recordId);
        
        
        System.debug('dataSourceList.get(0).get = '+dataSourceList);
        System.debug('dataSourceList.get(0).get = '+dataSourceList.get(0).get('Parent_Object_Name__c'));

        queryString = String.format(queryString, queryParamList);
        
        System.debug('dataSourceList = '+dataSourceList);
        System.debug('queryString = '+queryString);
       
        return Database.query(queryString);
    }
    
    
    
    @AuraEnabled
    public static Object process(String documentTemplate,String recordId) {
        System.debug('--=-- documentTemplate --=--'+documentTemplate);
        
        List<SObject> dataSourceList = retrieveDataSources(documentTemplate);
        List<SObject> documentTemplateList = retrieveDataSources(documentTemplate);
        List<Object> finalResponseList = new List<Object>();
        Map<String,Object> finalResponseMap = new Map<String,Object>();
        
        System.debug('dataSource list sholud be : '+dataSourceList);
        
        
        if(dataSourceList.isEmpty()) {
            System.debug('dataSourceList = '+dataSourceList);
            documentTemplateList = retrieveDocumentTemplate(documentTemplate,recordId);
            System.debug('dataSource list sholud be : '+documentTemplateList);
            return documentTemplateList;
        }
        
        if(!dataSourceList.isEmpty()) {
            
            for (SObject dataSource : dataSourceList ) {
                
                if (String.valueOf(dataSource.get('Type__c')).equalsIgnoreCase('restApi')) {
                    
                    finalResponseMap.put(String.valueOf(dataSource.get('Order__c')), fetchRestApi(dataSource));
                    
                } else if (String.valueOf(dataSource.get('Type__c')).equalsIgnoreCase('query')) {
                    
                    finalResponseMap.put(String.valueOf(dataSource.get('Order__c')), fetchQuery(dataSource));
                    
                } else if (String.valueOf(dataSource.get('Type__c')).equalsIgnoreCase('channelName')) {
                    
                    finalResponseMap.put(String.valueOf(dataSource.get('Order__c')), fetchChannelName(dataSource));
                    
                } else if (String.valueOf(dataSource.get('Type__c')).equalsIgnoreCase('className')) {
                    
                    finalResponseMap.put(String.valueOf(dataSource.get('Order__c')), fetchClassName(dataSource));  
                }
            }
        }
        
        System.debug('finalResponseMap = '+finalResponseMap);
        return finalResponseMap;
    }
    
    @AuraEnabled
    public static Object fetchRestApi(SObject restwrapper) {
        
        Http h = new Http();
        
        HttpRequest httpReq = new HttpRequest();
        httpReq.setEndpoint(String.valueOf(restwrapper.get('Handler_Name__c')));
        httpReq.setTimeout(120000);
        httpReq.setMethod('GET');
        HttpResponse res = h.send(httpReq);
        system.debug('response get body in rest api '+res.getBody());
        system.debug('response get body in rest api '+JSON.serialize(JSON.deserializeUntyped(res.getBody())));
        return JSON.deserializeUntyped(res.getBody());
    }

    @AuraEnabled
    public static Object fetchQuery(SObject querywrapper) {
        System.debug('queryWrapper will be :'+querywrapper);
        List<SObject> sobjList = Database.query(String.valueOf(querywrapper.get('Handler_Name__c')));
        // return JSON.serialize(sobjList);
        System.debug('Database query will be : '+sobjList);
        return sobjList;
    }

    @AuraEnabled
    public static Object fetchChannelName(SObject channelNamewrapper) {
        Object responseObj ;
        String channelName = String.valueOf(channelNamewrapper.get('Name'));        
        String jsonStr = '{"request":[{"channelName":"'+channelName+'", "queryParams":"test", "requestPayload":"test payload"}]}';
        Map<String, Object> requestMap = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);
        
        Callable extension = (Callable) Type.forName('ICControllerGateway').newInstance();
        
        responseObj = extension.call('execute_sync', requestMap);
        return JSON.serialize(responseObj);
    }
    
    @AuraEnabled
    public static Object fetchClassName(SObject classNamewrapper) {        
        Map<String,Object> callableMap = new Map<String,Object>();
        
        Callable extension = (Callable) Type.forName(String.valueOf(classNamewrapper.get('Handler_Name__c'))).newInstance();
        Object responseObj = extension.call('execute_sync', callableMap);
        return JSON.serialize(responseObj);
    }

    
}