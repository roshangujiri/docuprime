public with sharing class DocumentTemplateHandler {
    Public static Boolean isProcessed=false;
    public static void isBeforeInsert(List<Document_Template__c> docTemp) {
         for(Document_Template__c dt : docTemp) {
            //ABDS:s:Commendted and added below logic 
            //dt.Template_Version__c = 'V1';
             if (string.isEmpty( dt.Template_Version__c )){
                dt.Template_Version__c = '1.0'; 
            }  
        }    
    }

    public static void isAfterInsert(List<Document_Template__c> docTemp) {
        if(!DocumentTemplateHandler.isProcessed)
        {
            DocumentTemplateHandler.isProcessed = true;
            updateDefaultStatus(docTemp);
            updateTemplateActivestatus(docTemp);
        }
        updateTemplateType(docTemp);
    }

    public static void isBeforeUpdate(List<Document_Template__c> docTemp) {
         /*for(Document_Template__c dt : docTemp) {
            Integer versionNumber = Integer.valueOf(dt.Template_Version__c.SubStringAfter('V'));
            versionNumber+=1;
            dt.Template_Version__c = 'V' + String.valueOf(versionNumber);
        }*/

         
    }

    public static void isAfterUpdate(List<Document_Template__c> docTemp) {
        if(!DocumentTemplateHandler.isProcessed)
        {
            DocumentTemplateHandler.isProcessed = true;
            updateDefaultStatus(docTemp);
            updateTemplateActivestatus(docTemp);
        }
        updateTemplateType(docTemp);
    }

    public static void updateDefaultStatus(List<Document_Template__c> listdoc){
		set<string> docNameSet = new set<string>();
		set<String> currDocId = new set<string>();
        list<Document_Template__c> lstDocTem = new list<Document_Template__c>();
		Map<id,Document_Template__c> docMap = new Map<id,Document_Template__c>();
  		for(Document_Template__c doc: listdoc){ 
            if(doc.Is_Active__c == true && doc.Is_Default__c == true ){
              	docNameSet.add(doc.Parent_Object_Name__c);
            }
	    	if(doc.Id != null){
            	currDocId.add(doc.Id);
	    	}
          	
    	}
     	Map<id, Document_Template__c> mapDocTemp = new Map<ID,Document_Template__c>([select id,Name,IS_Active__c,Parent_Object_Name__c,Record_Type__c,
                                              Is_Default__c from Document_Template__c where   Is_Active__c = true and
                                              Is_Default__c  = true and Parent_Object_Name__c IN:docNameSet]);
            for(Document_Template__c docObj: mapDocTemp.values()){
	        	if(((currDocId.size()==0) || (currDocId.size() > 0 && !currDocId.contains(docObj.Id)) && (Schema.sObjectType.Document_Template__c.fields.Is_Default__c.isUpdateable())) ){
					docObj.Is_Default__c = false;
                	lstDocTem.add(docObj);
				}
            }
            if((lstDocTem != Null) && (lstDocTem.size() > 0) && (Schema.sObjectType.Document_Template__c.fields.Is_Default__c.isUpdateable()) ){
                 update lstDocTem;
            }
    }

    public static void updateTemplateType(List<Document_Template__c> docTempList) { 
        Set<Document_Template__c> docTempSet = new Set<Document_Template__c>();
        List<Document_Content__c> contentIdList = new List<Document_Content__c>();
        
        for(Document_Template__c docTempObject : [SELECT Id FROM Document_Template__c WITH SECURITY_ENFORCED LIMIT 49999]) {
            docTempSet.add(docTempObject);
        }
        
        if(Schema.sObjectType.Document_Content__c.fields.Template_Type__c.isUpdateable()) {
            List<Document_Content__c> docContent = [SELECT Id, Document_Template__r.Template_Type__c FROM Document_Content__c
                                                    WHERE Document_Template__r.Id IN :docTempSet WITH SECURITY_ENFORCED];
            for(Document_Content__c docContObj : docContent) {
                Document_Content__c docCon = new Document_Content__c(Id = docContObj.Id);
                docCon.Template_Type__c = docContObj.Document_Template__r.Template_Type__c;
                contentIdList.add(docCon);
            }
            SObjectAccessDecision securityDecision = Security.stripInaccessible(
                                         AccessType.UPDATABLE, contentIdList);
            UPDATE securityDecision.getRecords();
        } else {
            throw new AuraHandledException('Template Field(s) not accessible.');
        }
    }
    
    Public static void updateTemplateActivestatus(List<Document_Template__c> docTempList)
    {
        System.debug('docTempList==>'+docTempList);
        //This variable is used to get all the prior document template of currnt temmplate 
        //if current template is active and not first one here current record id will be there 
        //and version 1 which needs to remove
        List<Document_Template__c> RelateddocTempList =new List<Document_Template__c>(); 
        
        //Update this list which does not contains any extra record
        List<Document_Template__c> RelateddocTempListToUpdate =new List<Document_Template__c>(); 
        
        //Get all the template id active and version more than 1
        set<Id> IdsDocument =new set<Id>(); 
        Integer version;
        for(Document_Template__c docTempobj:docTempList)
        {
            if  (docTempobj.Template_Version__c.replace('.0','').isNumeric())
            {
                version = Integer.valueOf( docTempobj.Template_Version__c.replace('.0',''));
            }
            else{
                continue;   
            }

            if(docTempobj.Is_Active__c == true && String.isNotBlank(docTempobj.Parent_Template__c) && version >1)
            {
                IdsDocument.add(docTempobj.Parent_Template__c);
            }
        }

        //This map is used to put all the related tamplete in map only active one 
        map<Id, List<Document_Template__c>> RelateddocTempMap= new  map<Id, List<Document_Template__c> >();

        System.debug('IdsDocument==>'+IdsDocument);

        if (!IdsDocument.isEmpty())
        {
            RelateddocTempList = [SELECT Parent_Template__c, Is_Active__c, Name, Id,Template_Version__c FROM Document_Template__c where 
                (Id in: IdsDocument OR Parent_Template__c In :IdsDocument) AND Is_Active__c=true];
        }


        System.debug('RelateddocTempList==>'+RelateddocTempList);

        for (Document_Template__c DocTempobj :RelateddocTempList)
        {
            
            if  (docTempobj.Template_Version__c.replace('.0','').isNumeric())
            {
                version = Integer.valueOf( docTempobj.Template_Version__c.replace('.0',''));
            }
            else 
            {
                System.debug('continue==>'+DocTempobj);
                continue;
            }

            list<Document_Template__c> DocTempListLoop;
            Id RelateddocTempId;
            if(version ==1)
            {
                DocTempListLoop  = RelateddocTempMap.Get(docTempobj.ID);
                RelateddocTempId=docTempobj.ID;
            }
            else 
            {
                DocTempListLoop= RelateddocTempMap.Get(docTempobj.Parent_Template__c);
                RelateddocTempId=docTempobj.Parent_Template__c;
            }

            System.debug('DocTempListLoop==>'+DocTempListLoop);

            if(DocTempListLoop!=null)
            {
                DocTempListLoop.add(DocTempobj);
                
            }
            else 
            {
                DocTempListLoop= new  list<Document_Template__c>();
                DocTempListLoop.add(DocTempobj);
            }

            RelateddocTempMap.put(RelateddocTempId,DocTempListLoop);
        }

        System.debug('RelateddocTempMap==>'+RelateddocTempMap);

        list<Document_Template__c> tempListDocTemplate= new  list<Document_Template__c> ();
        Integer tempversion;

        for(Document_Template__c docTempobj:docTempList)
        {
            if(docTempobj.Is_Active__c == true && String.isNotBlank(docTempobj.Parent_Template__c) )
            {
                if (RelateddocTempMap.get(docTempobj.Parent_Template__c)!=null)
                {
                    tempListDocTemplate=RelateddocTempMap.get(docTempobj.Parent_Template__c);
                    
                    for(Document_Template__c tempObjDocTemplate:tempListDocTemplate)
                    {
                        if ((tempObjDocTemplate.Template_Version__c.replace('.0','').isNumeric()) &&
                            (docTempobj.Template_Version__c.replace('.0','').isNumeric()) && (Schema.sObjectType.Document_Template__c.fields.Is_Active__c.isUpdateable()) && (Schema.sObjectType.Document_Template__c.fields.Is_ReadOnly__c.isUpdateable()))
                        {

                            tempversion = Integer.valueOf( tempObjDocTemplate.Template_Version__c.replace('.0',''));
                            version= Integer.valueOf( docTempobj.Template_Version__c.replace('.0',''));
                            
                            if (tempversion<version)
                            {
                                tempObjDocTemplate.Is_Active__c=false;
                                tempObjDocTemplate.Is_ReadOnly__c=true;
                                if (!RelateddocTempListToUpdate.contains(tempObjDocTemplate))
                                {
                                    RelateddocTempListToUpdate.add(tempObjDocTemplate); 
                                }
                            }
                        }
                    }
                }     
            }
        }

        System.debug('RelateddocTempListToUpdate'+RelateddocTempListToUpdate);

        if (!RelateddocTempListToUpdate.isEmpty())
        {
            update RelateddocTempListToUpdate; 
        }
   
    }
}