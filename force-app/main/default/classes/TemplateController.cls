@SuppressWarnings('PMD.ApexSuggestUsingNamedCred')
public with sharing class TemplateController {

    public static final String BODY = 'Body';
    public static final String PAGE_BREAK = 'Page Break';
    public static final String BLANK_PAGE = 'Blank Page';
    public static final String RELATED_RECORDS = 'Related Records';
    public static final String CUSTOM_CONTENT = 'Custom Content';
    public static final String PICKLIST = 'Picklist';
    public static final String DATESTRING = 'Date';

    public static App_Settings__c App_Setting= App_Settings__c.getOrgDefaults();
    
    @AuraEnabled
    public static void upsertSectionAndFields(Id templateId, List<Domain.SectionWrapper> sections) {
        List<Document_Content__c> sectionListToInsert = new List<Document_Content__c>();
        List<Document_Content__c> fieldListToInsert = new List<Document_Content__c>();
        List<Document_Template__c> templateList = new List<Document_Template__c>();
        Set<Id> setOfSectionIdWithBlankFields = new Set<Id>();
        Set<Id> setOfContentIdToDeleteSectionFields = new Set<Id>();
        try {
            templateList = [SELECT Id, Template_Type__c 
                            FROM Document_Template__c 
                            WHERE Id = :templateId WITH SECURITY_ENFORCED];
            String templateType = templateList[0].Template_Type__c;
            if(
                Schema.sObjectType.Document_Content__c.fields.Document_Template__c.isCreateable() && 
                Schema.sObjectType.Document_Content__c.fields.Document_Template__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Name.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Name.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Order_Sequence__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Order_Sequence__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Content_Type__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Content_Type__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Enable_Landscape_Layout__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Enable_Landscape_Layout__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Visibility__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Visibility__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Alignment__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Alignment__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Section_Content__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Section_Content__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Section_Key__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Section_Key__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Template_Type__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Template_Type__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Field_Type__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Field_Type__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Picklist_Values__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Picklist_Values__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Reference_Field__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Reference_Field__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Placeholder_Content__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Placeholder_Content__c.isUpdateable() &&
                Schema.sObjectType.Document_Content__c.fields.Query_JSON__c.isCreateable() &&
                Schema.sObjectType.Document_Content__c.fields.Query_JSON__c.isUpdateable()
            ) {
                for(Domain.SectionWrapper section : sections) {
                    Document_Content__c sectionObj = new Document_Content__c();
                    if(section.id != '') {
                        sectionObj.Id = section.id;
                    }
                    sectionObj.Document_Template__c = templateId;
                    sectionObj.Name = section.name;
                    sectionObj.Order_Sequence__c = section.orderSequence;
                    sectionObj.Content_Type__c = section.contentType;
                    if(BODY.equals(sectionObj.Content_Type__c) || RELATED_RECORDS.equals(sectionObj.Content_Type__c)
                    || CUSTOM_CONTENT.equals(sectionObj.Content_Type__c)) {
                        sectionObj.Enable_Landscape_Layout__c = section.isLandscapeLayout;
                    }
                    sectionObj.Visibility__c = section.visibility;
                    sectionObj.Alignment__c = section.alignment;
                    sectionObj.Section_Content__c = section.content;
                    sectionObj.Section_Key__c = section.key;
                    sectionObj.Template_Type__c = templateType;
                    sectionObj.Query_JSON__c = section.queryJSON;
                    sectionListToInsert.add(sectionObj);
                    
                    if (sectionObj.Id != null) {
                        setOfContentIdToDeleteSectionFields.add(sectionObj.Id);
                    }
                }
                if (!setOfContentIdToDeleteSectionFields.isEmpty()) {
                    List<Document_Content__c> listOfDocContentToDelete = [SELECT Id FROM Document_Content__c WHERE Content__c IN:setOfContentIdToDeleteSectionFields];
                    if (!listOfDocContentToDelete.isEmpty()) {
                        Database.DeleteResult[] deletedFieldResult = Database.delete(listOfDocContentToDelete);
                    }
                }
                for (Domain.SectionWrapper section : sections) {
                    for(Domain.FieldWrapper field : section.fields) {
                        Document_Content__c fieldObj = new Document_Content__c();
                        /*if(field.id != '') {
                            fieldObj.Id = field.id;
                        }*/
                        fieldObj.Name = field.name;
                        fieldObj.Field_Type__c = field.type;
                        fieldObj.Picklist_Values__c = field.picklistValues;
                        fieldObj.Order_Sequence__c = field.orderSequence;
                        fieldObj.Reference_Field__c = field.referenceField;
                        fieldObj.Placeholder_Content__c = field.placeholderContent;
                        fieldObj.Section_Key__c = field.sectionKey;
                        fieldObj.Template_Type__c = templateType;
                        fieldObj.Date_Format__c = fieldObj.Field_Type__c == DATESTRING ? field.dateFormat : '';
                        fieldListToInsert.add(fieldObj);
                    }
                }
                
                Database.UpsertResult[] results = Database.upsert(sectionListToInsert);
                for(Document_Content__c section : sectionListToInsert) {
                    for(Document_Content__c field : fieldListToInsert) {
                        if(section.Section_Key__c == field.Section_Key__c) {
                            field.Content__c = section.Id;
                        }
                    }
                
                }
                for (Document_Content__c rec : [SELECT Id FROM Document_Content__c WHERE Content__c IN: setOfSectionIdWithBlankFields]) {
                    rec.Content__c = null;
                    fieldListToInsert.add(rec);
                }
                Database.UpsertResult[] fieldResults = Database.upsert(fieldListToInsert);
            } else {
                throw new AuraHandledException('Template Field(s) not accessible.');
            }
        } catch( System.QueryException e) {
            throw new AuraHandledException('Template Field(s) not accessible.');
        }
    }

    @AuraEnabled
    public static List<ObjectData> getObjects(){
        // Query to get list of objects  
		List<EntityDefinition> entityList;
		
        if(Schema.sObjectType.EntityDefinition.fields.Label.isAccessible() && Schema.sObjectType.EntityDefinition.fields.QualifiedApiName.isAccessible()){
          entityList = [SELECT Label, QualifiedApiName FROM EntityDefinition WHERE IsCustomizable = true];
        }

      	List<string> objList = new List<string>();
        List<ObjectData> objDataList = new List<ObjectData>();
        for(EntityDefinition obj : entityList)
        {  	
            if(!(obj.QualifiedApiName.endsWith('__mdt') || obj.QualifiedApiName.endsWith('__e') ||
                 obj.QualifiedApiName.endsWith('__share') || obj.QualifiedApiName.endsWith('__feed')
                )
            
              ){
                objDataList.add(new ObjectData(obj.Label,obj.QualifiedApiName));
            	objList.add(obj.Label);
            }
          
         }
         
        return objDataList;
    
    }

    //To get record types based on object name
    @AuraEnabled(Cacheable = true)
    public static List<string> getObjectRecordType(string selectedObject) {
        List<string> recordTypesList = new List<string>();
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType ObjSchema = schemaMap.get(selectedObject);    
        
        if(ObjSchema!=null)
        {
        Map<String,Schema.RecordTypeInfo> rtInfoMap = ObjSchema.getDescribe().getRecordTypeInfosByName();
        for (String rtName: rtInfoMap.keySet()) 
        {  
                recordTypesList.add(rtName);
        } 
        recordTypesList.sort();
        }
       
        return recordTypesList;
    }

    public static string sessionSync(){
       
        String sessionId = '';
        
      
        if (App_Setting.Use_User_Session__c )
        {
            System.debug('Get session from user');
            sessionId =  UserInfo.getSessionID();  
        }else 
        {
            
            System.debug('Get session from page');
            // Refer to the Page
            PageReference sessionIdPage =Page.UserSessionPage;
            // Get the content of the VF page
            String vfContent = sessionIdPage.getContent().toString();
            // Find the position of Start and End
            Integer startPosition = vfContent.indexOf('Start') + 'Start'.length(),
            endPosition = vfContent.indexOf('End');
            // Get the Session Id
            sessionId = vfContent.substring(startPosition, endPosition); 
        }


        System.debug('sessionId '+sessionId);
        // Return Session Id
        return sessionId;
    }
    
    //SKP:s:to deactive existing template
    @AuraEnabled
    public static String getLatestVersion(Id recordId){

        Integer nextVersion=2;
        
        
        List<Document_Template__c>lstDocTemplateRecord;

        if(Schema.sObjectType.Document_Template__c.fields.Id.isAccessible() && Schema.sObjectType.Document_Template__c.fields.Name.isAccessible() && Schema.sObjectType.Document_Template__c.fields.Template_Version__c.isAccessible() && Schema.sObjectType.Document_Template__c.fields.Is_Active__c.isAccessible() ){
         lstDocTemplateRecord = [Select Id, Name,  Template_Version__c, Is_Active__c from Document_Template__c
                WHERE Parent_Template__c=:recordId AND Parent_Template__c !=null AND
                Template_Version__c !=null  Order by Template_Version__c desc LIMIT 1];
        }
        
        if(lstDocTemplateRecord.size()==1)
        {
            if (lstDocTemplateRecord[0].Template_Version__c.replace('.0','').isnumeric())
            {
                nextVersion=Integer.valueOf( lstDocTemplateRecord[0].Template_Version__c.replace('.0','')); 
                nextVersion++;
            }         
        }

        return nextVersion + '.0'  ;   


    }
    @AuraEnabled
    public static Document_Template__c getDocumentTemplate(Id recordId){
       Document_Template__c docTemplateRecord;
       List<Document_Template__c>lstDocTemplateRecord =[Select Id, Name, Additional_Info__c, Allow_Attach_As_PDF__c, 
                            Allow_Esign__c, Allow_Send_As_Email_Attachment__c, CreatedById,
                            Department__c, Business_Unit__c,Description__c, LastModifiedById, OwnerId, Parent_Object_Name__c,
                            Record_Type__c, Template_External_Id__c, Template_Type__c,
                            Template_Version__c, Is_Active__c from Document_Template__c
                            WHERE id=:recordId AND Is_Active__c = true WITH SECURITY_ENFORCED  LIMIT 1];
        if(lstDocTemplateRecord.size()>0)
        {
            docTemplateRecord=lstDocTemplateRecord[0];
        }
        return docTemplateRecord;
    }
    
    @AuraEnabled
    public static void deactivateTemplate(Id recordId){
        Document_Template__c oneDocumentTemplate= getDocumentTemplate(recordId);
        system.debug(oneDocumentTemplate);
        if((oneDocumentTemplate!=null) && (Schema.sObjectType.Document_Template__c.fields.Is_Active__c.isUpdateable()))
		    oneDocumentTemplate.Is_Active__c= false;

        update oneDocumentTemplate;
       
    }

    //SKP:e:to deactive existing template

    @AuraEnabled
    public static string getRecordObjectName(Id recordId) {
         return recordId.getSObjectType().getDescribe().getName();
    }

    public static String restGet(String query) {
        
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        System.debug('query==>'+query);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');

        if (App_Setting.Use_Named_Cred__c)
        {
            req.setEndpoint('callout:'+App_Setting.Named_Cred__c+query);            
        }else 
        {
            string baseURL = URL.getSalesforceBaseUrl().toExternalForm();
            req.setHeader('Authorization', 'Bearer ' + sessionSync());
            req.setEndpoint(baseURL+query);
            System.debug('sessionSync()'+ sessionSync());
            System.debug('baseURL_query==>'+baseURL+query);
           
        }  
       
        HttpResponse res = h.send(req);
        string responsestring=res.getBody();
        //TODO:s:Check for return type and show error message 
        return responsestring; 
        
    }
   
    @AuraEnabled(cacheable=true)
    public static List<FieldInfo> fetchFieldInfo(string searchKey ,string sObjectApiName) {   
        System.debug('fetchFieldInfo');
        list<FieldInfo> lstFieldInfo= new list<FieldInfo>(); 
        // A String variable to store any objects's API name
        //sObjectApiName = 'Account';

        // Get Map of sObject's schema fields 
        // Map<API_Name, Schema.sObjectField> - Key is API name.
        Map<String, Schema.SObjectField> M_Objects_Schema_Field = Schema.getGlobalDescribe().get(sObjectApiName).getDescribe().fields.getMap();

        // Loop the keyset of map.
        for( String Field_Name : M_Objects_Schema_Field.keySet() ) {
            FieldInfo objFieldInfo= new FieldInfo(); 
            Schema.DescribeFieldResult  Field_Description = M_Objects_Schema_Field.get( Field_Name ).getDescribe();
            
            
            // Label of the field
            objFieldInfo.FieldLabel=Field_Description.getLabel();

            if (!objFieldInfo.FieldLabel.toLowerCase().contains(searchKey.toLowerCase()))
            {
                continue;
            }

            //Refer Salesforce:DescribeFieldResult for more options.
        
            // API Name of the field
            objFieldInfo.FielAPIName=Field_Description.getName();
            // is a field a custom field or standard field.
            objFieldInfo.IsCustom=Field_Description.isCustom(); 
            
            objFieldInfo.key=sObjectApiName + '*' +   objFieldInfo.FielAPIName;

            objFieldInfo.RelationshipName=Field_Description.getRelationshipName();
            System.debug('Field Name==>'+objFieldInfo.FielAPIName);

            if (String.isNotBlank(objFieldInfo.RelationshipName)){
                List<Schema.SObjectType> lstSObjectType =Field_Description.getReferenceTo();
                
                for( Schema.SObjectType objSObjectType : lstSObjectType ) {
                    Schema.DescribeSObjectResult objDescribeSObjectResult=objSObjectType.getDescribe();
                    System.debug('objDescribeSObjectResult'+objDescribeSObjectResult.getName());
                    System.debug(objDescribeSObjectResult);
                    objFieldInfo.ParentObject=objDescribeSObjectResult.getName();
                    Map<String, Schema.SObjectField>  FieldSet = objDescribeSObjectResult.fields.getMap();
                    System.debug('FieldSet');
                    System.debug(FieldSet);
                    objFieldInfo.IsLookup=true;
                }
            }
            
            lstFieldInfo.add(objFieldInfo);
        }

        System.debug('lstFieldInfo');
        System.debug(JSON.serialize(lstFieldInfo));
        
        return lstFieldInfo;
    }

    @AuraEnabled
    public static void createDefaultTemplateUsingToolingAPI(string pTemplateId,string pObjectName,string pRecordType,string pLayoutName){

        System.debug('pTemplateId==>'+pTemplateId); 
        System.debug('pObjectName==>'+pObjectName); 
        System.debug('pRecordType==>'+pRecordType); 
        System.debug('pLayoutName==>'+pLayoutName); 
 
        if (App_Setting.Id==null){
            throw new AuraHandledException('Please enter session information in Application Custom setting.'); 
        }
        Id RecordTypeId = Schema.getGlobalDescribe().get(pObjectName).getDescribe().getRecordTypeInfosByName().get(pRecordType).getRecordTypeId();

        String query='/services/data/'+App_Setting.RestAPIVersion__c+'/sobjects/'+pObjectName+'/describe/layouts/'+RecordTypeId;
        
        System.debug('query'+query);
        string responsestring=restGet(query); 
        System.debug('responsestring'+responsestring);
        
        responsestring=responsestring.replaceAll('"sobject":', '"objectName":');
        LayoutJSON objfromJSON=(LayoutJSON) System.JSON.deserialize(responsestring, LayoutJSON.class);
        
        System.debug('fromJSON'+JSON.serialize(objfromJSON));

        list<string> FieldArray=new List<string>();
        pLayoutName = pObjectName+'-'+pLayoutName;
        //List<Metadata.Metadata> layouts =Metadata.Operations.retrieve(Metadata.MetadataType.Layout,new List<String> {pLayoutName});
       // Map<string,string> objectRelationshipMap = getReferenceFieldAPIName(pObjectName);

        list<Document_Content__c> lstDocumentContentSection= new list<Document_Content__c>();
        list<Document_Content__c> lstDocumentContentRelated= new list<Document_Content__c>();
        list<Document_Content__c> lstDocumentContentSectionFields= new list<Document_Content__c>();
        
        //sections
        integer SectionOrderSeq=0;

        list<Document_Content__c> lstDocument_ContenSeq = [select Id,Order_Sequence__c from Document_Content__c 
                                        where Document_Template__c=:pTemplateId order by Order_Sequence__c desc limit 1] ;
        if (lstDocument_ContenSeq.Size()==1)
        {
            SectionOrderSeq=(integer)lstDocument_ContenSeq[0].Order_Sequence__c;
        }

        List<String> leftSideHtml = new List<String>();
        List<String> rightSideHtml = new List<String>();
        Integer i =1;
        Integer noOfcolumns =0; 
        Integer widthLabelPercent =17; 
        Integer widthContentPercent =33; 
        string allFieldsHtml = '';

        for (LayoutJSON.cls_detailLayoutSections lst_detailLayoutSections : objfromJSON.detailLayoutSections) 
        {
            System.debug('--- Detail Layout Sections --->'+lst_detailLayoutSections);
            //section fields
            leftSideHtml = new List<String>();
            rightSideHtml = new List<String>();

            allFieldsHtml='';
            i=1;
            List<String> fieldsHtml=new List<String>();

            list<Document_Content__c> lstDocumentContentSectionFieldsLoop= new list<Document_Content__c>();
            Document_Content__c objDocumentContentSection= new Document_Content__c();
            objDocumentContentSection.Document_Template__c=pTemplateId;
            objDocumentContentSection.Content_Type__c='Body';
            objDocumentContentSection.Name=lst_detailLayoutSections.heading;
            objDocumentContentSection.Order_Sequence__c=++SectionOrderSeq;
            objDocumentContentSection.Section_Key__C=''+SectionOrderSeq;
            noOfcolumns=lst_detailLayoutSections.columns;
            if (noOfcolumns==1){
                widthContentPercent=83;
            }
            else {
                widthContentPercent=66/(noOfcolumns);  
            }
           
            for (LayoutJSON.cls_layoutRows lst_layoutRows:lst_detailLayoutSections.layoutRows)
            {
                
                for (LayoutJSON.cls_layoutItems lst_layoutItems:lst_layoutRows.layoutItems)
                {
                    System.debug('---Layout Item--->'+lst_layoutItems);
                    String layoutItemLabel = lst_layoutItems.Label;

                    if (lst_layoutItems.layoutComponents.size()==0 && string.isBlank( lst_layoutItems.Label))
                    {
                        fieldsHtml.add('<td  style="width:'+widthLabelPercent+'%;" class="labelCol">'+ ' ' +'</td><td style="width:'+widthContentPercent+'%;" class="dataCol col02"> </td>');
                        continue;
                    }

                    for (LayoutJSON.cls_layoutComponents obj_layoutComponent:lst_layoutItems.layoutComponents)
                    {
                        System.debug('---> '+obj_layoutComponent);
                        if (obj_layoutComponent.type!='Field')
                        {
                            continue;
                        }

                        if (obj_layoutComponent.components!=null)
                        {
                            for (LayoutJSON.cls_components obj_components:obj_layoutComponent.components)
                            {
                                if(math.mod(i, noOfcolumns) == 1){
                                    //leftSideHtml.add('<td  style="width:20%;">'+obj_components.value+'</td><td  style="width:30%;">['+obj_components.value+']</td>');
                                    fieldsHtml.add('<td  style="width:'+widthLabelPercent+'%;" class="labelCol">'+obj_components.value+'</td><td style="width:'+widthContentPercent+'%;" class="dataCol col02">['+obj_components.value+'] </td>');
                                }else{
                                    //rightSideHtml.add('<td style="width:20%;">'+obj_components.value+'</td><td  style="width:30%;">['+obj_components.value+']</td>');
                                    fieldsHtml.add('<td style="width:'+widthLabelPercent+'%;" class="labelCol">'+obj_components.value+'</td><td style="width:'+widthContentPercent+'%;" class="dataCol">['+obj_components.value+']</td>');
                                }
                                
                                Document_Content__c objDocumentContentField= new Document_Content__c();
                                objDocumentContentField.Content_Type__c='Body';
                                objDocumentContentField.Field_Type__c='string';
                                objDocumentContentField.Name=obj_components.value;
                                //objDocumentContentField.Reference_Field__c= pObjectName+'.'+obj_components.value;
                                objDocumentContentField.Reference_Field__c= getLookupObjectNameField(pObjectName,obj_components.value);
                                objDocumentContentField.Placeholder_Content__c=obj_components.value;
                                objDocumentContentField.Order_Sequence__c=SectionOrderSeq;
                                objDocumentContentField.Field_Label__c = layoutItemLabel;
                                lstDocumentContentSectionFieldsLoop.add(objDocumentContentField);
                                lstDocumentContentSectionFields.add(objDocumentContentField);
                            }

                            continue;

                        }
                        
                        if(math.mod(i, noOfcolumns) == 1){
                            //leftSideHtml.add('<td  style="width:20%;">'+lst_layoutItems.label+'</td><td  style="width:30%;">['+obj_layoutComponent.value+']</td>');
                            fieldsHtml.add('<td  style="width:'+widthLabelPercent+'%;" class="labelCol">'+lst_layoutItems.label+'</td><td style="width:'+widthContentPercent+'%;" class="dataCol col02">['+obj_layoutComponent.value+'] </td>');
                        }else{
                            //rightSideHtml.add('<td style="width:20%;">'+lst_layoutItems.label+'</td><td style="width:30%;">['+obj_layoutComponent.value+']</td>');
                            fieldsHtml.add('<td style="width:'+widthLabelPercent+'%;" class="labelCol">'+lst_layoutItems.label+'</td><td style="width:'+widthContentPercent+'%;" class="dataCol">['+obj_layoutComponent.value+']</td>');
                        }
                        
                        Document_Content__c objDocumentContentField= new Document_Content__c();
                        objDocumentContentField.Content_Type__c='Body';
                        objDocumentContentField.Field_Type__c='string';
                        objDocumentContentField.Name=obj_layoutComponent.value;
                        //objDocumentContentField.Reference_Field__c= pObjectName+'.'+obj_layoutComponent.value;
                        objDocumentContentField.Reference_Field__c=getLookupObjectNameField(pObjectName,obj_layoutComponent.value);
                        objDocumentContentField.Placeholder_Content__c=obj_layoutComponent.value;
                        objDocumentContentField.Order_Sequence__c=SectionOrderSeq;
                        objDocumentContentField.Field_Label__c = layoutItemLabel;
                        lstDocumentContentSectionFieldsLoop.add(objDocumentContentField);
                        lstDocumentContentSectionFields.add(objDocumentContentField);
                    }
                    
                    i++;  
                } 
            }

            if (lstDocumentContentSectionFieldsLoop.size()==0)
            {
                --SectionOrderSeq;
                continue;
            }

            
            // fieldsHtml.addAll(rightSideHtml);
            // fieldsHtml.addAll(leftSideHtml);
            //allFieldsHtml='<table style="width:100%;">';
            allFieldsHtml='<div class="bPageBlock"> ';//<div class="pbHeader"> </div>
            allFieldsHtml+='<div class="pbBody"> <h3>'+lst_detailLayoutSections.heading+'</h3>   </div> ';
            allFieldsHtml+='<div class="pbSubsection"> <table style="width:100%;" class="detailList sectionTable" border="0" cellspacing="0" cellpadding="0">';
            allFieldsHtml+='<tbody>';

            for(Integer j=0; j<fieldsHtml.size(); j++){
                // if(j<leftSideHtml.size() && leftSideHtml[j] != null){
                //     allFieldsHtml = allFieldsHtml+ '<tr>'+leftSideHtml[j];
                // }
                // if(j<rightSideHtml.size() && rightSideHtml[j] != null){
                //     allFieldsHtml = allFieldsHtml+rightSideHtml[j]+'</tr>';
                // }
                if(math.mod(j, noOfcolumns) == 0){
                    allFieldsHtml = allFieldsHtml+ '<tr>'+fieldsHtml[j];     
                }
                else if(math.mod(j, noOfcolumns) == (noOfcolumns-1)){
                    allFieldsHtml = allFieldsHtml+ fieldsHtml[j] + '</tr>';  
                }
                else{
                    allFieldsHtml = allFieldsHtml+ fieldsHtml[j];
                }

            }

            //allFieldsHtml+='</table>';
            allFieldsHtml+='</tbody>';
            allFieldsHtml+='</table>';
            allFieldsHtml+='</div></div>';

            objDocumentContentSection.Section_Content__c=allFieldsHtml;
            insert objDocumentContentSection;
            lstDocumentContentSection.add(objDocumentContentSection);
            for (Document_Content__c objDocumentContentField:lstDocumentContentSectionFieldsLoop)
            {
                objDocumentContentField.Content__c=objDocumentContentSection.Id;
            }

        }

        System.debug('Layout Related Lists --> '+ objfromJSON.relatedLists );
        //Insert related list
        for (LayoutJSON.cls_relatedLists objRelated : objfromJSON.relatedLists) 
        {
            Schema.DescribeSObjectResult[]  descResult = Schema.describeSObjects( new String[] { objRelated.objectName });
            if(!descResult[0].isQueryable())
            {
                continue;
            }

            Document_Content__c objDocumentContent= new Document_Content__c();
            objDocumentContent.Document_Template__c=pTemplateId;
            objDocumentContent.Content_Type__c='Related Records';
            objDocumentContent.Name= objRelated.label;
            objDocumentContent.Order_Sequence__c=++SectionOrderSeq;
            objDocumentContent.Section_Content__c= '<div class="bPageBlock">';
            objDocumentContent.Section_Content__c+='<div class="pbHeader"> </div> <div class="pbBody">  <h3>'+objRelated.label+'</h3></div>';
            objDocumentContent.Section_Content__c+='<div class="pbSubsection">'; 
            objDocumentContent.Section_Content__c+='[TABLE_PLACEHOLDER]';
            objDocumentContent.Section_Content__c+='</div></div>';
            //objDocumentContent.Enable_Landscape_Layout__c=true;

            //Fields Name
            list<string> lstFields=new list<string>();
            for (LayoutJSON.cls_columns field:objRelated.columns)
            {
                    
                lstFields.add(field.fieldApiName);
                    
            }

            objDocumentContent.Query_JSON__c='';
            objDocumentContent.Query_JSON__c+='{"fields":"'+String.join(lstFields,',') +'",';
            objDocumentContent.Query_JSON__c+='"objectName":"'+objRelated.objectName+'",';
            objDocumentContent.Query_JSON__c+='"parentFieldApiName":"'+objRelated.field+'",';   
            objDocumentContent.Query_JSON__c+='"filter":"",';//Id !=null
            objDocumentContent.Query_JSON__c+='"orderByField":"",';//Id
            objDocumentContent.Query_JSON__c+='"orderBy":"",';//ASC
            objDocumentContent.Query_JSON__c+='"recordLimit":"50",';//100
            objDocumentContent.Query_JSON__c+='"tableStyle":"width: 100%;","enableTableHeader":true,'+
                                    '"tableHeaderStyle":"border: 1px solid    black;text-align:' + 
                                    'left;padding: 8px;","tableHeaderRowStyle":"","row1Style":"",'+ 
                                    '"enableAlternateRowStyle":false,"row2Style":"",'+
                                    '"cellStyle":"border: 1px solid black;text-align: left;padding: 8px;"';
            objDocumentContent.Query_JSON__c+= '}';
             
             
            lstDocumentContentRelated.add(objDocumentContent);
        }
        
        if (lstDocumentContentSectionFields.size()>0)
        {
            insert lstDocumentContentSectionFields;
        }
        
        if (lstDocumentContentRelated.size()>0)
        {
            insert lstDocumentContentRelated;
        }  
         
    }

    @AuraEnabled
    public static string getLookupObjectNameField(string pObjectName,string FieldAPIName )
    {
        String fieldName=''; 
             
        SObjectType parentObjectType = Schema.getGlobalDescribe().get(pObjectName);
        Map<String, SObjectField> fieldsMap = parentObjectType.getDescribe().fields.getMap();
 
        if(fieldsMap.containsKey(FieldAPIName))
            {
                Schema.DisplayType fieldDataType = fieldsMap.get(FieldAPIName).getDescribe().getType();
                if(fieldDataType == Schema.DisplayType.Reference)
                {                   
                    Schema.SobjectField childNameField = Schema.getGlobalDescribe().get(pObjectName).getDescribe().fields.getMap().get(FieldAPIName);
                    SObjectType childSObjType = Schema.getGlobalDescribe().get(childNameField.getDescribe().getReferenceTo()[0].getDescribe().getName());                   
                    Map<String, SObjectField> childFieldsMap = childSObjType.getDescribe().fields.getMap();
                   
                    if (childFieldsMap.containsKey('Name') && childFieldsMap.get('Name').getDescribe().isNameField())
                    {
                        string relationshipName = fieldsMap.get(FieldAPIName).getDescribe().getRelationshipName();                   
                        fieldName =pObjectName+'.'+ relationshipName +'.'+ childFieldsMap.get('Name').getDescribe().getName();
                    }
                    else 
                    {                       
                        fieldName = pObjectName +'.'+FieldAPIName;
                    }
                } else 
                {
                    fieldName = pObjectName +'.'+FieldAPIName;
                }

            } else 
            {
            fieldName = pObjectName +'.'+FieldAPIName;
            }
           
        return fieldName;
    }
    
    @AuraEnabled
    public static Map<string,string> getReferenceFieldAPIName(String parentObjectName){
        Map<string,string> objectRelationshipMap = new Map<string,string>();
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        for(String schmaSobjType: schemaMap.keyset()){
            Schema.SObjectType objToken=schemaMap.get(schmaSobjType);
            //schmaSobjType.equalsignorecase(parentObjectName)
            if(schmaSobjType.toUpperCase() == parentObjectName.toUpperCase()){
                //find details about sobject
                Schema.DescribeSObjectResult objDescribe=objToken.getdescribe();
                List<Schema.ChildRelationship> childRelationshipList = objDescribe.getChildRelationships();
                for(Schema.ChildRelationship schmaChldRel:childRelationshipList){
                    //string RelationshipName=ss.getRelationshipName();
                    string childObjectName = string.valueof(schmaChldRel.getChildSObject());
                    string childFieldToken = string.valueof(schmaChldRel.getField());
                    String removedDocSobjectName ='';
                    String removedDocFieldName = '';
                    // if(childObjectName.contains('__') && childFieldToken.contains('__')){
                    //     system.debug('childObjectName=>'+childObjectName+',childFieldToken=>'+childFieldToken);
                    //     String remFrmChilObName = childObjectName.split('__')[0];
                    //     String remFrmChilFldTokn = childFieldToken.split('__')[0];
                    //     removedDocSobjectName = childObjectName.replace(remFrmChilObName+'__','');
                    //     removedDocFieldName = childFieldToken.replace(remFrmChilFldTokn+'__','');
                    //     system.debug('remFrmChilObName=>'+remFrmChilObName+',remFrmChilFldTokn=>'+remFrmChilFldTokn);
                    //     objectRelationshipMap.put(removedDocSobjectName.toUpperCase(),removedDocFieldName);
                    // }
                    // else{
                        objectRelationshipMap.put(childObjectName.toUpperCase(),childFieldToken);   
                    //}
                }
            }
        }
        return objectRelationshipMap;   
    }

    @AuraEnabled										
	public static void deleteContent(List<Id> contentIdList) {
        if(Document_Content__c.sObjectType.getDescribe().isDeletable()) {
            System.debug('contentIdList'+contentIdList);
            DELETE [SELECT Id FROM Document_Content__c WHERE Id IN :contentIdList WITH SECURITY_ENFORCED];
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Domain.TemplateWrapper getTemplateData(Id templateId) {
        List<Document_Template__c> templateList = new List<Document_Template__c>();
        List<Document_Content__c> sectionList = new List<Document_Content__c>();
        Document_Template__c template = new Document_Template__c();
        List<Domain.SectionWrapper> secWrapList = new List<Domain.SectionWrapper>();
        List<Domain.FieldWrapper> fieldWrapList;
        List<Id> sectionIds = new List<Id>();
        templateList = [SELECT Id, Name, Template_Type__c, Template_Version__c, Is_Active__c,Is_Default__c,Page_Size__c,
                            Department__c,Business_Unit__c, Description__c, Allow_Attach_As_PDF__c, 
                            Allow_Send_As_Email_Attachment__c, Allow_Esign__c, Additional_Info__c,
                            Parent_Object_Name__c,Record_Type__c,Is_ReadOnly__c,//SKP:added to get Record_Type__c for Document_Template__c
                            (SELECT Id, Name, Order_Sequence__c, Content_Type__c, Visibility__c, Alignment__c, 
                            Section_Content__c, Query_JSON__c, Enable_Landscape_Layout__c
                            FROM TempContents__r
                            ORDER BY Order_Sequence__c ASC
                            NULLS LAST)
                        FROM Document_Template__c 
                        WHERE Id = :templateId
                        WITH SECURITY_ENFORCED
                        LIMIT 1];
        template = templateList[0];

        Domain.TemplateWrapper tempWrap = new Domain.TemplateWrapper();
        tempWrap.id = template.Id;
        tempWrap.name = template.Name;
        tempWrap.type = template.Template_Type__c;
        tempWrap.version = template.Template_Version__c;
        tempWrap.isActive = template.Is_Active__c;
        tempWrap.isDefault = template.Is_Default__c;
        tempWrap.department = template.Department__c;//Business_Unit__c
        tempWrap.businessUnit = template.Business_Unit__c;
        tempWrap.description = template.Description__c;
        tempWrap.allowAttachAsPDF = template.Allow_Attach_As_PDF__c;
        tempWrap.allowSendAsEmailAttachment = template.Allow_Send_As_Email_Attachment__c;
        tempWrap.allowEsign = template.Allow_Esign__c;
        tempWrap.additionalInfoJSON = template.Additional_Info__c;
        tempWrap.parentObjectName = template.Parent_Object_Name__c;
        tempWrap.recordType=template.Record_Type__c;
        tempWrap.isReadOnly=template.Is_ReadOnly__c;
        tempWrap.pagesize=template.Page_Size__c;
        for(Document_Content__c section : template.TempContents__r) {
            Domain.SectionWrapper secWrap = new Domain.SectionWrapper();
            secWrap.id = section.Id;
            secWrap.name = section.Name;
            secWrap.orderSequence = section.Order_Sequence__c.intValue();
            secWrap.contentType = section.Content_Type__c;
            secWrap.isLandscapeLayout = section.Enable_Landscape_Layout__c;
            secWrap.isBodyContent = (section.Content_Type__c == BODY || section.Content_Type__c == CUSTOM_CONTENT || section.Content_Type__c == RELATED_RECORDS);
            secWrap.isCustomContent = section.Content_Type__c == CUSTOM_CONTENT;
            secWrap.isRelatedRecords = section.Content_Type__c == RELATED_RECORDS;
            secWrap.isPageBreakOrBlankPage = (section.Content_Type__c == PAGE_BREAK || section.Content_Type__c == BLANK_PAGE);
            secWrap.isPageBreak = section.Content_Type__c == PAGE_BREAK;
            secWrap.isBlankPage = section.Content_Type__c == BLANK_PAGE;
            secWrap.visibility = section.Visibility__c;
            secWrap.alignment = section.Alignment__c;
            secWrap.content = section.Section_Content__c;
            secWrap.queryJSON = section.Query_JSON__c;
            secWrapList.add(secWrap);
            sectionIds.add(section.Id);
        }
        sectionList = [SELECT Id,
                            (SELECT Id, Name, Content__c, Order_Sequence__c, Field_Type__c,
                                    Placeholder_Content__c, Picklist_Values__c, Reference_Field__c, Date_Format__c, Field_Label__c 
                            FROM Contents__r
                            ORDER BY Order_Sequence__c ASC
                            NULLS LAST) 
                        FROM Document_Content__c 
                        WHERE Document_Template__c = :templateId 
                        WITH SECURITY_ENFORCED
                        ORDER BY Order_Sequence__c ASC
                        NULLS LAST];
        for(Domain.SectionWrapper secWrap : secWrapList) {
            for(Document_Content__c section : sectionList) {
                if(secWrap.id == section.Id) {
                    fieldWrapList = new List<Domain.FieldWrapper>();
                    for(Document_Content__c field : section.Contents__r) {
                        Domain.FieldWrapper fieldWrap = new Domain.FieldWrapper();
                        fieldWrap.id = field.Id;
                        fieldWrap.name = field.Name;
                        fieldWrap.type = field.Field_Type__c;
                        fieldWrap.isPicklist = fieldWrap.type == PICKLIST ? true : false;
                        fieldWrap.orderSequence = field.Order_Sequence__c.intValue();
                        fieldWrap.referenceField = field.Reference_Field__c;
                        fieldWrap.picklistValues = field.Picklist_Values__c;
                        fieldWrap.placeholderContent = field.Placeholder_Content__c;
                        fieldWrap.isDate = fieldWrap.type == DATESTRING ? true : false;
                        fieldWrap.fieldLabel = field.Field_Label__c;
                        fieldWrapList.add(fieldWrap);
                    }
                    secWrap.fields = fieldWrapList;
                }
            }
        }
        tempWrap.sections = secWrapList;
        return tempWrap;
    }

    /**
     * @description:    checks if the vf page is available in the org or not.
     * @param:          String pageName (name of page).
     * @returns:        Boolean
     */
    @AuraEnabled(cacheable=true)
    public static Boolean isVFPageAvailable(String pageName) {
        List<ApexPage> pageList = new List<ApexPage>();
        pageList = [SELECT Id, Name 
                    FROM ApexPage 
                    WHERE name = :pageName
                    WITH SECURITY_ENFORCED LIMIT 1];
        if(pageList.size() == 1) {
            return true;
        } else {
            return false;
        }
    }

    public class FieldInfo
    {
        // FieldInfo(){
        //     this.IsLookup=false;
        // }
        @AuraEnabled
        public string FieldLabel;
        @AuraEnabled
        public string key;
        @AuraEnabled
        public string FielAPIName;
        @AuraEnabled
        public boolean IsCustom;
        @AuraEnabled
        public boolean IsLookup;
        @AuraEnabled
        public string ParentObject;
        @AuraEnabled
        public string ReferenceTo;
        @AuraEnabled
        public string RelationshipName;
    }

    /**
     * Wrapper class to get both fieldname and label of an object
     */
    public class ObjectData{

        @AuraEnabled
        public string objectName { get; set; }
        @AuraEnabled
        public string objectLabel { get; set; }
      
     
        public ObjectData(string objectLabel,
                          string objectName
                         ){
            this.objectName = objectName;
            this.objectLabel = objectLabel;
          
        }
    }
    
    @AuraEnabled
    public static List<String> getRelatedFields(string selectedObject){
        SObjectType contactType = Schema.getGlobalDescribe().get(selectedObject);
        Map<String,Schema.SObjectField> mfields = contactType.getDescribe().fields.getMap();
        
        List<String> sObjectDetailsList = new List<String>();
        List<String> sObjectLookupFieldsList = new List<String>();
        List<String> sObjectFieldsList = new List<String>();
        for(String fieldName : mfields.keySet()){

            Schema.DescribeFieldResult  Field_Description = mfields.get( fieldName ).getDescribe();
            
            if (Field_Description.getType()==Schema.DisplayType.ADDRESS )
            {
                continue;
            }

            if(String.isNotBlank(Field_Description.getRelationshipName()))
            //if(mfields.get(fieldName).getDescribe().getType() == Schema.DisplayType.REFERENCE)
            {
                sObjectLookupFieldsList.add(String.valueOf(mfields.get(fieldName))+' > ');
            }
            else
            {
                sObjectFieldsList.add(String.valueOf(mfields.get(fieldName)));
            }
        }
        sObjectLookupFieldsList.sort();
        sObjectDetailsList.addAll(sObjectLookupFieldsList);
        sObjectFieldsList.sort();
        sObjectDetailsList.addAll(sObjectFieldsList);
        
        
        return sObjectDetailsList;
    }
    //Get fields Name of First lookup Object field 
    @AuraEnabled
    public static List<String> getRelatedLookUpObjectFields(string selectedLookupField,string selectedObject){
        
        if(String.isNotBlank(selectedLookupField) && String.isNotBlank(selectedObject)){
            Schema.SobjectField theField = Schema.getGlobalDescribe().get(selectedObject).getDescribe().fields.getMap().get(selectedLookupField);
            
            SObjectType contactType = Schema.getGlobalDescribe().get(theField.getDescribe().getReferenceTo()[0].getDescribe().getName());
           
            Map<String,Schema.SObjectField> mfields = contactType.getDescribe().fields.getMap();
            
            List<String> sObjectDetailsList = new List<String>();
            List<String> sObjectLookupFieldsList = new List<String>();
            List<String> sObjectFieldsList = new List<String>();
            for(String fieldName : mfields.keySet()){
                
                Schema.DescribeFieldResult  Field_Description = mfields.get( fieldName ).getDescribe();
                if (Field_Description.getType()==Schema.DisplayType.ADDRESS )
                {
                    continue;
                }

                if(String.isNotBlank(Field_Description.getRelationshipName()))
                //if(mfields.get(fieldName).getDescribe().getType() == Schema.DisplayType.REFERENCE)
                {
                    sObjectLookupFieldsList.add(String.valueOf(mfields.get(fieldName))+' > ');
                }else{
                    sObjectFieldsList.add(String.valueOf(mfields.get(fieldName)));
                }
                //sObjectDetailsList.add(String.valueOf(mfields.get(fieldName)));
            }
            sObjectLookupFieldsList.sort();
            sObjectDetailsList.addAll(sObjectLookupFieldsList);
            sObjectFieldsList.sort();
            sObjectDetailsList.addAll(sObjectFieldsList);
           
            return sObjectDetailsList;
		}
        return null;
    }

    //Get fields Name of Second lookup Object field 
    @AuraEnabled
    public static List<String> getRelatedLookUpObjectFields2(string selectedLookupField2, string selectedLookupField,string selectedObject){
        SObjectType contactType;
        if(String.isNotBlank(selectedLookupField2) && String.isNotBlank(selectedLookupField) && String.isNotBlank(selectedObject)){
            Schema.SobjectField theField = Schema.getGlobalDescribe().get(selectedObject).getDescribe().fields.getMap().get(selectedLookupField);
           
            Schema.SobjectField theField2 = Schema.getGlobalDescribe().get(theField.getDescribe().getReferenceTo()[0].getDescribe().getName()).getDescribe().fields.getMap().get(selectedLookupField2);
            
            contactType = Schema.getGlobalDescribe().get(theField2.getDescribe().getReferenceTo()[0].getDescribe().getName());
        }else{
            contactType = Schema.getGlobalDescribe().get(selectedObject);
        }
        if(contactType != null){
            Map<String,Schema.SObjectField> mfields = contactType.getDescribe().fields.getMap();
            
            List<String> sObjectDetailsList = new List<String>();
            List<String> sObjectLookupFieldsList = new List<String>();
            List<String> sObjectFieldsList = new List<String>();
            for(String fieldName : mfields.keySet()){
                /*if(mfields.get(fieldName).getDescribe().getType() == Schema.DisplayType.REFERENCE)
                {
                    sObjectLookupFieldsList.add(String.valueOf(mfields.get(fieldName))+' > ');
                }else{
                    sObjectFieldsList.add(String.valueOf(mfields.get(fieldName)));
                }*/
                if (mfields.get(fieldName).getDescribe().getType() !=Schema.DisplayType.ADDRESS )
                {
                    sObjectDetailsList.add(String.valueOf(mfields.get(fieldName)));
                }
                                
            }
            sObjectDetailsList.sort();
            //sObjectLookupFieldsList.sort();
            //sObjectDetailsList.addAll(sObjectLookupFieldsList);
            //sObjectFieldsList.sort();
            //sObjectDetailsList.addAll(sObjectFieldsList);
            
            return sObjectDetailsList;
        }
        return null;
    }

    @AuraEnabled
    public static list<Document_Template__c>  getActiveTemplatesForObject(string  objectApiName){
        
       List<Document_Template__c> lstActiveDocTemplate =[SELECT Id, Name,Template_Type__c ,Is_Default__c,
                                                        Template_Version__c,Is_Active__c,CreatedDate
                                                        FROM Document_Template__c
                                                        WHERE Parent_Object_Name__c=:objectApiName
                                                        AND Is_Active__c = true
                                                        //WITH SECURITY_ENFORCED
                                                        Order By Name ];
        
        return lstActiveDocTemplate;
    }

    @AuraEnabled
    public static String  deleteCorporateDocIdforTemplate(string  templateId,string  recordId){
        List<Corporate_Document__c> lsCorporateDocument;
		
        if((Schema.sObjectType.Corporate_Document__c.fields.Id.isAccessible()) && (Schema.sObjectType.Corporate_Document__c.fields.Name.isAccessible()) && (Schema.sObjectType.Corporate_Document__c.fields.Document_Template__c.isAccessible()) && (Schema.sObjectType.Corporate_Document__c.fields.Document_Stage__c.isAccessible())){
          lsCorporateDocument  = [SELECT Id, Name, Document_Template__c,
        Document_Stage__c,Document_Template__r.Name
        FROM Corporate_Document__c WHERE Document_Template__c = :templateId 
        AND Related_Record__c=:recordId	];//LIMIT 1  
        }
         
                        
        if ((lsCorporateDocument.size()>0) && (Schema.sObjectType.Corporate_Document__c.isDeletable())){
            delete lsCorporateDocument;
        }
         
        return '';
         
    }

    @AuraEnabled
    public static String  getCorporateDocIdforTemplate(string  templateId,string  recordId){
        List<Corporate_Document__c> lsCorporateDocument;
        
         if ((Schema.sObjectType.Corporate_Document__c.fields.Id.isAccessible()) && (Schema.sObjectType.Corporate_Document__c.fields.Name.isAccessible()) && (Schema.sObjectType.Corporate_Document__c.fields.Document_Template__c.isAccessible()) && (Schema.sObjectType.Corporate_Document__c.fields.Document_Stage__c.isAccessible())){
      		lsCorporateDocument	= [SELECT Id, Name, Document_Template__c,
        Document_Stage__c,Document_Template__r.Name
        FROM Corporate_Document__c WHERE Document_Template__c = :templateId 
        AND Related_Record__c=:recordId	 order by CreatedDate Desc LIMIT 1];
    			}             
        
        if (lsCorporateDocument.size()>0)
        {
            return lsCorporateDocument[0].Id;
        }
        else 
        {
            return '';
        }
    }

    @AuraEnabled
    public static String  getCreateCorporateDocIdforTemplate(string  templateId,string  recordId){
        System.debug('templateId'+templateId);
        System.debug('recordId'+recordId);
        List<Corporate_Document__c> lsCorporateDocument = [SELECT Id, Name, Document_Template__c,
                        Document_Stage__c,Document_Template__r.Name
                        FROM Corporate_Document__c WHERE Document_Template__c = :templateId 
                        AND Related_Record__c=:recordId LIMIT 1 ];
                        
        if (lsCorporateDocument.size()>0)
        {
            return lsCorporateDocument[0].Id;
        }
        else 
        {
            Document_Template__c objDocDocument = [SELECT Id, Name
                        FROM Document_Template__c WHERE Id = :templateId LIMIT 1 ];

            AutoGenerateDocumentWrapper obj = new AutoGenerateDocumentWrapper();
            list<AutoGenerateDocumentWrapper> objlist = new list<AutoGenerateDocumentWrapper>();
            obj.recordId=recordId;
            obj.templateName=objDocDocument.Name;
            obj.attachDocument=false;
            obj.sendForEsign=false;
            objlist.add(obj);
            AutoGenerateDocumentController.autoGenerateDocumentFromTemplate(objlist);

            lsCorporateDocument = [SELECT Id, Name, Document_Template__c, Document_Stage__c
                        FROM Corporate_Document__c WHERE Document_Template__c = :templateId LIMIT 1 ];
            if (lsCorporateDocument.size()>0)
            {
                return lsCorporateDocument[0].Id;
            }
            else 
            {
                 
                throw new AuraHandledException('Unable to generate document.'); 
                
            }
        }
    }

    @AuraEnabled
    public static string getRealtionshipName(string parentObjectName,string childObjectName)
    {
        SObjectType parentObjectType = Schema.getGlobalDescribe().get(parentObjectName);
        SObjectType childObjectType = Schema.getGlobalDescribe().get(childObjectName);
        
        string relationshipName='';
       
        for(ChildRelationship relation: parentObjectType.getDescribe().getChildRelationships()) {
            if(relation.getChildSObject() == childObjectType) {
               relationshipName = relation.getField().getDescribe().getName();
               system.debug('relationshipName'+relationshipName);
                break;
            }
        }

        return relationshipName;
    }
}