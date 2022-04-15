public class LayoutJSON{
	//public cls_layouts[] layouts;
	//public cls_recordTypeMappings[] recordTypeMappings;
	//public cls_recordTypeSelectorRequired[] recordTypeSelectorRequired;
	
    //public class cls_layouts {
		public cls_detailLayoutSections[] detailLayoutSections;
		public String id;
		public cls_relatedLists[] relatedLists;
		 
	//}
	
    public class cls_relatedLists {
		 
		public cls_columns[] columns;
		public boolean custom;
		public String field;	//AccountId
		public String label;	//Account History
		public Integer limitRows;	//5
		public String name;	//Histories
		public String objectName;	//AccountHistory
		//public cls_sort[] sort;
	}
	
    public class cls_columns {
		public String fieldApiName;	//CreatedDate
		public String label;	//Date
		 
	}
    
	public class cls_detailLayoutSections {
		public String heading; 
		public cls_layoutRows[] layoutRows;
		public Boolean collapsed;
		public Integer columns;
		public Boolean useHeading;
	 
	}
    
	public class cls_layoutRows {
		public cls_layoutItems[] layoutItems;
		 
	}
	
    public class cls_layoutItems {
		public String label;	//Account Owner
		public cls_layoutComponents[] layoutComponents;
		
	}
    
	public  class cls_layoutComponents {
		public String value;	//OwnerId
		public String type;		//Field
		public cls_components[] components;
		
	}

	public  class cls_components {
		public String value;	//MailingStreet
		public String type;		//Field
		
	}
	 	 
	public static LayoutJSON parse(String json){
		return (LayoutJSON) System.JSON.deserialize(json, LayoutJSON.class);
	}
}