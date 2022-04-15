global with sharing class ICGateway {
    @AuraEnabled
    public static Object executeMethod(String requestStr, String documentTemplateId){
        String requiredData;
        System.debug('requestStr'+requestStr);
        System.debug('documentTemplateId'+documentTemplateId);
        Map<String, Object> request = (Map<String, Object>) JSON.deserializeUntyped(requestStr);
        System.debug('request'+request);
     
       // Map<String, Object> requestPayloadMap = new Map<String, Object>();
        
        
        Map<String, Object> requestMap = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(request.get('request')));
     	System.debug('requestMap = '+requestMap);
        
       /* requestPayloadMap.put('requestPayload',requestMap.get('requestPayload'));
        System.debug('requestPayloadMap = '+JSON.serialize(requestPayloadMap));
        
        requiredData=String.valueOf(JSON.deserializeUntyped(JSON.serialize(requestMap.get('requestPayload'))));
        System.debug('requiredData = '+JSON.serialize(requestMap.get('requestPayload')));
       */
	
        System.debug('requestMap.get = '+requestMap.get('requestPayload'));
        setRequestBody(JSON.serialize(requestMap.get('requestPayload')));
        Map<String, Object> wrapperMap = new Map<String, Object>();
        
        system.debug('requiredData'+requiredData);
        
        
        String serviceName = String.valueOf(requestMap.get('serviceName'));
        /*system.debug('serviceName = '+serviceName); */
        List<SObject> lstRecords =  queryMetadata(serviceName);
        system.debug('listOfRecords line 21 = '+lstRecords);
        
        String className =String.valueOf(lstRecords.get(0).get('Class_Name__c'));
        String channelName =String.valueOf(lstRecords.get(0).get('Channel_Name__c'));
        boolean isSync = Boolean.valueOf(lstRecords.get(0).get('isSync__c'));
        String executeType = isSync ? 'execute_sync': 'execute_async';
        boolean isExecuteClientSide = Boolean.valueOf(lstRecords.get(0).get('Client_side_execution__c'));
        
        requestMap.remove('serviceName');
        requestMap.put('channelName',channelName);
        requestMap.put('executeClientSide',isExecuteClientSide);
        //System.debug('newRequestMap = '+requestMap.get('queryParams'));
       
        lwapic.ICChannelRequest icreq= new lwapic.ICChannelRequest();
        icreq.channelName = channelName;
        icreq.queryParams = String.valueOf(requestMap.get('queryParams'));
        icreq.requestPayload =  String.valueOf(requestMap.get('requestPayload'));
        
        System.debug('icreq = '+icreq);
        
        List<lwapic.ICChannelRequest> wrapperList = new List<lwapic.ICChannelRequest>();
        wrapperList.add(icreq);
        System.debug('wrapperList = '+wrapperList);
        wrapperMap.put('request',wrapperList);
             System.debug('wrapperMap = '+wrapperMap);
        /* system.debug('wrapperList = '+wrapperList);*/
        System.debug('className = '+className);
        Callable extension = (Callable) Type.forName(className).newInstance();
        Map<String, Object> finalResponeMap = new Map<String, Object>();
        System.debug('extension = '+extension);
        System.debug('wrapperMap = '+wrapperMap);
          System.debug('executeType = '+executeType);
          
        finalResponeMap = (Map<String, Object>) extension.call(executeType.trim(), wrapperMap);
        System.debug('finalResponeMap'+finalResponeMap);
        
      
        if(String.isNotBlank(documentTemplateId)){
        List<lwapic.ICResponseWrapper> instance = (List<lwapic.ICResponseWrapper>) finalResponeMap.get('response');
        Map<String, Object> responseBodyMap = (Map<String, Object>) JSON.deserializeUntyped(instance.get(0).responseBody);
        Document_Template__c docTemplate =new Document_Template__c();
        docTemplate.Id = documentTemplateId;
        docTemplate.Template_External_Id__c = String.valueOf(responseBodyMap.get('data')).split('=').get(1).remove('}');
        UPDATE docTemplate;
        }
        
        return finalResponeMap;
        
    }
    public static String requestBody;
    private static void setRequestBody(String reqBody){
        requestBody = reqBody;
        system.debug('requestBodyInPrivate'+requestBody);
    }	
    
    private static List<SObject> queryMetadata(String serviceName ){
        system.debug('serviceName = '+serviceName);
        String query ='SELECT isSync__c, Client_side_execution__c, Class_Name__c, Channel_Name__c, QualifiedApiName FROM Org_Setting__mdt  WHERE QualifiedApiName='+'\''+ serviceName + '\'';
        List<SObject> lstRecords = Database.query(query);
        System.debug('lstRecords = '+lstRecords);
        
        return lstRecords;
    }
    
}