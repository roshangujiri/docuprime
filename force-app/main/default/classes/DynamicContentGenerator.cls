/**
 * @name         :    DynamicContentGenerator
 * @description  :    Interface to be implemented for using
 *                    custom content functionality.
 */
global interface DynamicContentGenerator {
    /**
	 * @description  :    
	 * @param        :    Id recordId, String input
	 * @return       :    String - HTML markup
	 */
    String getHTML(Id recordId, String input);
    
    /**
	 * @description  :    
	 * @param        :    Id recordId, String input
	 * @return       :    String - Placeholder and value in JSON format
	 */
    String getJSON(Id recordId, String input);
}