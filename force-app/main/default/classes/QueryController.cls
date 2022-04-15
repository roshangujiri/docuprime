/**
 * @name         :    QueryController
 * @description  :    Defines methods to query sobject records,
 *                    fetch field labels and relationship infomation.
 */
public with sharing class QueryController {
	/**
	 * @description  :    Queries the child sObject records based on 
	 *                    parent sObject record id.
	 * @param        :    Id recordId, String queryJSON
	 * @return       :    List<sObject> - List of sObjects
	 */
	@AuraEnabled(cacheable=true)
	public static List<sObject> getRecordList(
		Id recordId,
		String queryJSON) 
	{
        queryJSON = String.escapeSingleQuotes(queryJSON);
        recordId = String.escapeSingleQuotes(recordId);
        Domain.QueryJsonWrapper queryObj = (Domain.QueryJsonWrapper)JSON.deserialize(
				queryJSON, Domain.QueryJsonWrapper.class);
		
		String strFields = String.escapeSingleQuotes(queryObj.fields);
		String strObjectName = String.escapeSingleQuotes(queryObj.objectName);
		String strFilter = String.escapeSingleQuotes(queryObj.filter);
		String strParentFieldApiName = String.escapeSingleQuotes(queryObj.parentFieldApiName);
		String strOrderByField = String.escapeSingleQuotes(queryObj.orderByField);
		String strOrderBy = String.escapeSingleQuotes(queryObj.orderBy);
		//Integer intLimit = Integer.valueOf(queryObj.recordLimit);
		string strLimit =queryObj.recordLimit;

		//ABDS:s:For FLS
		list<String> permissableFieldsList= new list<String>();
		SObjectType schemaType = Schema.getGlobalDescribe().get(strObjectName);
		Map<String, SObjectField> mapObjectFields = schemaType.getDescribe().fields.getMap();
	
		 for (String field : strFields.split(',')){
			if (mapObjectFields.get(field)!=null){
				if (mapObjectFields.get(field).getDescribe().isAccessible()){
					permissableFieldsList.add(field.trim());
				}	
			}
		 }
				 
		
		// strFields=String.join(permissableFieldsList, ',' );
		//ABDS:e:For FLS
		
		String queryStr = String.format('{0}{1}{2}{3}{4}', new List<String>{
			'SELECT ', String.valueOf(strFields), ' FROM ', String.valueOf(strObjectName), ' WHERE '
		});
		
		if(String.isNotBlank(strFilter)) {
			queryStr = String.format('{0}{1}{2}', new List<String>{
				queryStr, strFilter, ' AND '
			});
		}
		
		// queryStr = String.format('{0}{1}{2}{3}{4} {5}{6}{7}', new List<String>{
		// 	queryStr, strParentFieldApiName, ' = \''+ recordId + '\' ', 
		// 	' WITH SECURITY_ENFORCED ORDER BY ', strOrderByField, strOrderBy, ' LIMIT ', String.valueOf(intLimit)
		// });

		queryStr = String.format('{0}{1}{2}{3}', new List<String>{
			queryStr, strParentFieldApiName, ' = \''+ recordId + '\' ', 
			' WITH SECURITY_ENFORCED'
		});

		if(String.isNotBlank(strOrderByField)) {
			queryStr = String.format('{0}{1} {2} {3} ', new List<String>{
				queryStr,' ORDER BY ', strOrderByField, strOrderBy
			});
		}	

		if(String.isNotBlank(strLimit) ){
			queryStr = String.format('{0}{1}{2}', new List<String>{
				queryStr,' LIMIT ', String.valueOf(strLimit)
			});
		}
		
		
		/*String queryStr = 'SELECT ' + queryObj.fields + 
			' FROM ' + queryObj.objectName + 
			' WHERE ';
		if(String.isNotBlank(queryObj.filter)) {
			queryStr += queryObj.filter + ' AND ';
		}
		queryStr += queryObj.parentFieldApiName + ' = \''+ recordId + '\' ' + 
			' ORDER BY ' + queryObj.orderByField + ' ' + queryObj.orderBy +
			' LIMIT ' + queryObj.recordLimit;*/
			
		return Database.query(queryStr);
	}

	/**
	 * @description  :    Queries the child sObject records based on 
	 *                    set of parent sObject record ids.
	 * @param        :    Set<Id> recordIdSet, String queryJSON
	 * @return       :    List<sObject> - List of sObjects
	 */
	public static List<sObject> getRecordList(
		Set<Id> recordIdSet,
		String queryJSON) 
	{  
        queryJSON = String.escapeSingleQuotes(queryJSON);
		System.debug('getRecordList2');          
		List<sObject> recordList = new List<sObject>();
		List<sObject> recordListToReturn = new List<sObject>();
        Domain.QueryJsonWrapper queryObj = (Domain.QueryJsonWrapper)JSON.deserialize(
				queryJSON, Domain.QueryJsonWrapper.class);
				
		String strFields = String.escapeSingleQuotes(queryObj.fields);
		String strObjectName = String.escapeSingleQuotes(queryObj.objectName);
		String strFilter = String.escapeSingleQuotes(queryObj.filter);
		String strParentFieldApiName = String.escapeSingleQuotes(queryObj.parentFieldApiName);
		String strOrderByField = String.escapeSingleQuotes(queryObj.orderByField);
		String strOrderBy = String.escapeSingleQuotes(queryObj.orderBy);
		
		//Include Parent field as well in query 
		if (!strFields.contains(strParentFieldApiName) && string.isNotBlank(strParentFieldApiName)){
			strFields+=','+strParentFieldApiName;
		}

		String queryStr = String.format('{0}{1}{2}{3}{4}', new List<String>{
			'SELECT ', String.valueOf(strFields), ' FROM ', String.valueOf(strObjectName), ' WHERE '
		});

		if(String.isNotBlank(strFilter)) {
			queryStr = String.format('{0}{1}{2}', new List<String>{
				queryStr, strFilter, ' AND '
			});
		}
		
		// queryStr = String.format('{0}{1}{2}{3}{4} {5}{6}', new List<String>{
		// 	queryStr, strParentFieldApiName, ' IN :recordIdSet ', 
		// 	' WITH SECURITY_ENFORCED ORDER BY ', strOrderByField, strOrderBy, ' LIMIT 49999'
		// });

		queryStr = String.format('{0}{1}{2}{3}', new List<String>{
			queryStr, strParentFieldApiName, ' IN :recordIdSet ', 
			' WITH SECURITY_ENFORCED'
		});

		if(String.isNotBlank(strOrderByField)) {
			queryStr = String.format('{0}{1} {2} {3} {4}', new List<String>{
				queryStr,' ORDER BY ', strOrderByField, strOrderBy,' LIMIT 49999'
			});
		}	

		/*String queryStr = 'SELECT ' + queryObj.fields + 
			' FROM ' + queryObj.objectName + 
			' WHERE ';
		if(String.isNotBlank(queryObj.filter)) {
			queryStr += queryObj.filter + ' AND ';
		}
		queryStr += queryObj.parentFieldApiName + ' IN :recordIdSet ' + 
			' ORDER BY ' + queryObj.orderByField + ' ' + queryObj.orderBy +
			' LIMIT 49999';*/

		recordList = Database.query(queryStr);
		Integer recordLimit = String.isBlank(queryObj.recordLimit)? 49999 : Integer.valueOf(queryObj.recordLimit) ; 
		//Limit the records for each parent record id
		for(Id parentRecordId : recordIdSet) {
			Integer count = 0;
			for(sobject record : recordList) {
				if(count < recordLimit && (parentRecordId == record.get(queryObj.parentFieldApiName))) {
					recordListToReturn.add(record);
					count++;
				}
			}
		}
		return recordListToReturn;
	}
	
	/**
	 * @description  :    Fetches the field labels based on field api names.
	 * @param        :    String objectName, String fieldList
	 * @return       :    List<Domain.FieldNamesWrapper> - List of field api name & Label wrapper
	 */
    @AuraEnabled(cacheable=true)
    public static List<Domain.FieldNamesWrapper> getFieldLabelList(String objectName, String fieldList) {
        List<String> fieldLabelList = new List<String>();
		List<String> fieldApiNameList = new List<String>();
		List<Domain.FieldNamesWrapper> fieldNamesWrapperList = new List<Domain.FieldNamesWrapper>();
		String fieldApiNameListConcat = '';

		fieldApiNameList = fieldList.deleteWhitespace().toLowerCase().split(',');
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType sObjectSchema = schemaMap.get(objectName);
        Map<String, Schema.SObjectField> fieldMap = sObjectSchema.getDescribe().fields.getMap();
		for(String inputFieldApiName: fieldApiNameList) {
			for(String fieldApiName: fieldMap.keySet()) {
				if(inputFieldApiName.equalsIgnoreCase(fieldApiName)) {
					fieldApiNameListConcat += fieldMap.get(fieldApiName).getDescribe().getLabel() + ',';
					fieldNamesWrapperList.add(
						new Domain.FieldNamesWrapper(fieldMap.get(fieldApiName).getDescribe().getLabel(), 
						fieldMap.get(fieldApiName).getDescribe().getName())
					);
					break;
				}
			}
		}
		return fieldNamesWrapperList;
	}

	/**
	 * @description  :    Fetches the list of field labels based on Object prefix and list of field api names.
	 * @param        :    List<Domain.RelationshipWrapper> relationshipInfoList
	 * @return       :    List<Domain.RelationshipWrapper> - List of completed Relationship Info Wrapper 
	 */
	@AuraEnabled(cacheable=true)
    public static List<Domain.RelationshipWrapper> getCompletedRelationshipInfoList(List<Domain.RelationshipWrapper> relationshipInfoList) {
		List<Schema.SObjectType> sObjectList = Schema.getGlobalDescribe().Values();
		Map<String, Schema.DescribeSObjectResult> objectMap = new Map<String, Schema.DescribeSObjectResult>();
		for(Domain.RelationshipWrapper sObjectInfo : relationshipInfoList) {
			for(Schema.SObjectType sObj : sObjectList) {
				if(sObj.getDescribe().getKeyPrefix() != Null && sObj.getDescribe().getKeyPrefix().equals(sObjectInfo.objectPrefix)) {
					objectMap.put(sObj.getDescribe().getKeyPrefix(), sObj.getDescribe());
					sObjectInfo.objectName = sObj.getDescribe().getLabel();
					for(String inputFieldApiName : sObjectInfo.inputFieldApiNames) {
						if(sObjectInfo.fieldsList == Null) {
							sObjectInfo.fieldsList = new List<Domain.FieldNamesWrapper>();
							sObjectInfo.fieldsList.add(
								new Domain.FieldNamesWrapper(sObj.getDescribe().fields.getMap().get(inputFieldApiName.toLowerCase()).getDescribe().getLabel(),
								sObj.getDescribe().fields.getMap().get(inputFieldApiName.toLowerCase()).getDescribe().getName()
							));
						} else {
							sObjectInfo.fieldsList.add(
								new Domain.FieldNamesWrapper(sObj.getDescribe().fields.getMap().get(inputFieldApiName.toLowerCase()).getDescribe().getLabel(),
								sObj.getDescribe().fields.getMap().get(inputFieldApiName.toLowerCase()).getDescribe().getName()
							));
						}
					}
					break;
				}
			}
		}
		return relationshipInfoList;
	}
}