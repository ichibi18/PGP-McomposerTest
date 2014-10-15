
Ext.Loader.setConfig({
disableCaching: false,
enabled: true,
paths: {   
    MyPath:'/App',
	GeoExt: "/lib/GeoExt",		
	} 
});

Ext.application({
    name: 'OL3EXT4',	
	requires:[
		'MyPath.mappanel',								
		],
    launch: function () {
	
		
		var MapPanel= Ext.create('MyPath.mappanel',{		
		});	 		
		
		
		 
	
        Ext.create('Ext.container.Viewport', {	
            layout: 'border',						
            items:[			
				MapPanel
				
            ]
        });	
    }
});


