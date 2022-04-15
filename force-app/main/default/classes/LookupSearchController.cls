/**
 * @name         :    LookupSearchController
 * @description  :    Used for the lookup search component(lookupSearch) to get the 
 *                    Objects/Fields data and return list of objects and fields
 */
public without sharing class LookupSearchController {

    @AuraEnabled(cacheable=true) 
    public static List<String> findRecords(String searchKey, String objectName) {
        List<String> listOfObjects = new List<String>();
        //Logic to return data when searched for parent object
        if ((String.isNotBlank(objectName)) && (objectName == 'NonSetupObjects') && (Schema.sObjectType.EntityDefinition.fields.id.isAccessible()) && (Schema.sObjectType.EntityDefinition.fields.DeveloperName.isAccessible()) && (Schema.sObjectType.EntityDefinition.fields.DeveloperName.isAccessible()) ) {
            String sKey = '%'+searchKey+'%';
            for (EntityDefinition def : [Select id, DeveloperName, IsTriggerable, QualifiedApiName from EntityDefinition Where IsTriggerable = true and QualifiedApiName like :sKey]) {
                listOfObjects.add(def.QualifiedApiName);
            }
        } else if (String.isNotBlank(objectName) && objectName.contains('-getChild') && String.isNotBlank(searchKey)) { // Logic to return data for child object
            List<String> listOfObjectsToQuery = new List<String>();
            String parentObject = objectName.split('-')[0];
            Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            for(String ss1: schemaMap.keyset()) {
                Schema.SObjectType objToken=schemaMap.get(ss1);
                if(ss1.equalsignorecase(parentObject)){
                    //find details about sobject
                    Schema.DescribeSObjectResult objDescribe=objToken.getdescribe();
                    //get child objects
                    List<Schema.ChildRelationship> childRelationshipList = objDescribe.getChildRelationships();
                    for(Schema.ChildRelationship cr: objDescribe.getChildRelationships()){
                        if (String.valueOf(cr.getChildSObject()).containsIgnoreCase(searchKey) && cr.getRelationshipName() != null) {
                            listOfObjectsToQuery.add(String.valueOf(cr.getChildSObject()));
                        }
                    }
                    break;
                }
            }
            if (!listOfObjectsToQuery.isEmpty()) {
                for (EntityDefinition def : [Select id, DeveloperName, IsTriggerable, QualifiedApiName from EntityDefinition Where IsTriggerable = true and QualifiedApiName IN :listOfObjectsToQuery]) {
                    listOfObjects.add(def.QualifiedApiName);
                }
            }
            
        } else if (String.isNotBlank(objectName) && String.isNotBlank(searchKey)){ //search for the fields of the object selected
            Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
            for(Schema.SObjectField sfield : fieldMap.Values())
            {
                schema.describefieldresult dfield = sfield.getDescribe();
                if( dfield.getType() ==  Schema.DisplayType.ADDRESS) 
                {
                    continue;
                }
                if (dfield.getName().containsIgnoreCase(searchKey) || searchKey == 'No Search') {
                    listOfObjects.add(dfield.getName());
                }
            }
        }
        
        return listOfObjects;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SObJectResult> getResults(String ObjectName, String value, List<String> selectedRecId) {
    //data for multi select cmp
        List<SObJectResult> sObjectResultList = new List<SObJectResult>();
        if(selectedRecId == null) {
            selectedRecId = new List<String>();
        }
        Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(ObjectName).getDescribe().fields.getMap();
        for(Schema.SObjectField sfield : fieldMap.Values())
        {
            schema.describefieldresult dfield = sfield.getDescribe();
            if( dfield.getType() ==  Schema.DisplayType.ADDRESS) 
            {
                continue;
            }

            if (selectedRecId.isEmpty()) {
                if (dfield.getName().containsIgnoreCase(value) || value == 'No Search') {
                    sObjectResultList.add(new SObjectResult(dfield.getName(), dfield.getName()));
                }
            } else {
                if ((dfield.getName().containsIgnoreCase(value) || value == 'No Search') && !selectedRecId.contains(dfield.getName())) {
                    sObjectResultList.add(new SObjectResult(dfield.getName(), dfield.getName()));
                }
            }
            
        }
        return sObjectResultList;
    }

    public class SObjectResult {
        @AuraEnabled
        public String recName;
        @AuraEnabled
        public String recId;


    public SObJectResult(String recNameTemp, String recIdTemp) {
            recName = recNameTemp;
            recId = recIdTemp;
        }
        public SObJectResult() {

        }
    }
    
    @AuraEnabled
    public static List<RefFieldWrapper> getFieldNameForRefField(String objectName) {
        //check if the field is present in object's available fields to autofill the data on UI
        List<RefFieldWrapper> listOfRefField = new List<RefFieldWrapper>();
        Schema.SObjectType ObjSchema =  Schema.getGlobalDescribe().get(objectName);    
       
        if (ObjSchema!=null) {
            Map <String, Schema.SObjectField> fieldMap = ObjSchema.getDescribe().fields.getMap();
            for(Schema.SObjectField sfield : fieldMap.Values())
            {
                schema.describefieldresult dfield = sfield.getDescribe();
                listOfRefField.add(new RefFieldWrapper(dfield.getLabel(), objectName+'.'+dfield.getName()));
            }
        }
        return listOfRefField;
    }
    
    public class RefFieldWrapper {
        @AuraEnabled
        public String fieldLabel;
        @AuraEnabled
        public String fieldApiName;
        public RefFieldWrapper(String fieldLabelTemp, String fieldApiNameTemp) {
            fieldLabel = fieldLabelTemp;
            fieldApiName = fieldApiNameTemp;
        }
        
    }
}