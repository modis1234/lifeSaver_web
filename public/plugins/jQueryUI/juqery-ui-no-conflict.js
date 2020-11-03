define([
    'jquery',
    'jquery-ui-src',
], function(
    $
){
	$.widget.bridge('uibutton', $.ui.button);
    return $;
})