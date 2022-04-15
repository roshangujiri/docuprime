/**
 * @name         :    Domain
 * @description  :    Container for all the wrapper classes.
 */
public with sharing class Domain {
    
    public with sharing class TemplateWrapper {
        @AuraEnabled public String id {get; set;}
        @AuraEnabled public String name {get; set;}
        @AuraEnabled public String type {get; set;}
        @AuraEnabled public String version {get; set;}
        @AuraEnabled public Boolean isActive {get; set;}
        @AuraEnabled public Boolean isDefault {get; set;}
        @AuraEnabled public String department {get; set;}
        @AuraEnabled public String businessUnit {get; set;}
        @AuraEnabled public String pagesize {get; set;}
        @AuraEnabled public String description {get; set;}
        @AuraEnabled public Boolean allowAttachAsPDF {get; set;}
        @AuraEnabled public Boolean allowSendAsEmailAttachment {get; set;}
        @AuraEnabled public Boolean allowEsign {get; set;}
        @AuraEnabled public String additionalInfoJSON {get; set;}
        @AuraEnabled public String parentObjectName {get; set;}
        @AuraEnabled public String recordType {get; set;}//SKP:added to get Record_Type__c for Document_Template__c
        @AuraEnabled public Boolean isReadOnly {get; set;}//SKP:added to get Is_ReadOnly__c for Document_Template__c
        @AuraEnabled public List<SectionWrapper> sections {get; set;}
    }
    
    public with sharing class SectionWrapper {
        @AuraEnabled public String id {get; set;}
        @AuraEnabled public String key {get; set;}
        @AuraEnabled public String name {get; set;}
        @AuraEnabled public Integer orderSequence {get; set;}
        @AuraEnabled public String contentType {get; set;}
        @AuraEnabled public String visibility {get; set;}
        @AuraEnabled public String alignment {get; set;}
        @AuraEnabled public Boolean isLandscapeLayout {get; set;}
        @AuraEnabled public Boolean isBodyContent {get; set;}
        @AuraEnabled public Boolean isCustomContent {get; set;}
        @AuraEnabled public Boolean isRelatedRecords {get; set;}
        @AuraEnabled public Boolean isPageBreakOrBlankPage {get; set;}
        @AuraEnabled public Boolean isPageBreak {get; set;}
        @AuraEnabled public Boolean isBlankPage {get; set;}
        @AuraEnabled public String queryJSON {get; set;}
        @AuraEnabled public String content {get; set;}
        @AuraEnabled public String templateName {get; set;}
        @AuraEnabled public String templateId {get; set;}
        @AuraEnabled public List<String> childFields {get; set;}
        @AuraEnabled public List<FieldWrapper> fields {get; set;}
    }
    
    public with sharing class FieldWrapper {
        @AuraEnabled public String id {get; set;}
        @AuraEnabled public String key {get; set;}
        @AuraEnabled public String sectionKey {get; set;}
        @AuraEnabled public String name {get; set;}
        @AuraEnabled public String fieldLabel {get; set;}
        @AuraEnabled public String type {get; set;}
        @AuraEnabled public Integer orderSequence {get; set;}
        @AuraEnabled public String referenceField {get; set;}   
        @AuraEnabled public String picklistValues {get; set;}
        @AuraEnabled public String placeholderContent {get; set;}
        @AuraEnabled public Boolean isPicklist {get; set;}
        @AuraEnabled public Boolean isDate {get; set;}
        @AuraEnabled public String dateFormat {get; set;}
        @AuraEnabled public Boolean isHidden {get; set;}
    }
    
    public with sharing class DocumentWrapper {
        @AuraEnabled public String lastModifiedDate {get; set;}
        @AuraEnabled public Id id {get; set;}
        @AuraEnabled public String name {get; set;}
        @AuraEnabled public Id templateId {get; set;}
        @AuraEnabled public String stage {get; set;}
        @AuraEnabled public List<SectionWrapper> sections {get; set;}
    }
    
    public with sharing class PicklistOptionWrapper {
        @AuraEnabled public String label {get;set;}
        @AuraEnabled public String value {get;set;}
    }

    public class CustomContentWrapper {
        public String implementationClass {get;set;}
        public String customType {get;set;}
        public String customInput {get;set;}
        public Boolean isCustomJson {get;set;}
        public String jsonAvailability {get;set;}
    }
    
    public class CustomContentJson {
        public String placeholder {get;set;}
        public String value {get;set;}
    }
    
    public class QueryJsonWrapper {
        public String fields {get;set;}
        public String objectName {get;set;}
        public String parentFieldApiName {get;set;}
        public String filter {get;set;}
        public String orderByField {get;set;}
        public String orderBy {get;set;}
        //ABDS:s:20211209:Now this is not mandatory
        //public Integer recordLimit {get;set;}
        public String recordLimit {get;set;}
        public String tableStyle {get;set;}
        public Boolean enableTableHeader {get;set;}
        public String tableHeaderStyle {get;set;}
        public String tableHeaderRowStyle {get;set;}
        public String row1Style {get;set;}
        public String row2Style {get;set;}
        public Boolean enableAlternateRowStyle {get;set;}
        public String cellStyle {get;set;}
    }
    
    public class FieldNamesWrapper {
        @AuraEnabled public String label {get; set;}
        @AuraEnabled public String apiName {get; set;}
        public FieldNamesWrapper(String label, String apiName) {
            this.label = label;
            this.apiName = apiName;
        }
    }

    public class RelationshipWrapper {
        @AuraEnabled public String objectName {get; set;}
        @AuraEnabled public String objectPrefix {get; set;}
        @AuraEnabled public String relationshipName {get; set;}
        @AuraEnabled public List<FieldNamesWrapper> fieldsList {get; set;}
        @AuraEnabled public List<String> inputFieldApiNames {get; set;}
        public RelationshipWrapper() {}
        public RelationshipWrapper(String relationshipName, List<String> inputFieldApiNames) {
            this.relationshipName = relationshipName;
            this.inputFieldApiNames = inputFieldApiNames;
        }
    }

    public with sharing class UserInputsDataWrapper {
        @AuraEnabled public String relatedRecordId {get; set;}
        @AuraEnabled public String templateName {get; set;}
        @AuraEnabled public Boolean attachDocument {get; set;}
        @AuraEnabled public Boolean sendForEsign {get; set;}
    }

    public with sharing class CorporateDocumentPDFAttachmentWrapper {
        @AuraEnabled public String relatedRecordId {get; set;}
        @AuraEnabled public String corporateDocumenId {get; set;}
        @AuraEnabled public String corporateDocumentName {get; set;}
        @AuraEnabled public String contentVersionId {get; set;}
        @AuraEnabled public String contentDocumentId {get; set;}
        @AuraEnabled public String contentDocumentLinkId {get; set;}
        @AuraEnabled public Boolean attachDocument {get; set;}
        @AuraEnabled public Boolean sendForEsign {get; set;}
    }

    public with sharing class WebhookCalloutWrapper {
        @AuraEnabled public String serviceName {get; set;}
        @AuraEnabled public String contentVersionId {get; set;}
        @AuraEnabled public String approverEmail {get; set;}
        @AuraEnabled public String approverName {get; set;} 
        @AuraEnabled public String relatedRecordId {get; set;}
        @AuraEnabled public String templateName {get; set;}
    }

    public with sharing class ESignCalloutDataWrapper {
        @AuraEnabled public String contentVersionId {get; set;}
        @AuraEnabled public String approverEmail {get; set;}
        @AuraEnabled public String approverName {get; set;} 
    }
    
    public with sharing class ESignWebhookWrapper {
        @AuraEnabled public String service {get; set;}
        @AuraEnabled public List<ESignCalloutDataWrapper> documentInfo {get; set;}
    }
}