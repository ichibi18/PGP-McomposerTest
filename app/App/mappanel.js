

Ext.define('MyPath.mappanel',{
	extend:'GeoExt.panel.Map',
	alias:'Widget.mappanel',	
	title: "Philippine Geoportal - Map Composer",   			
	layout:'border',	
	region:'center',
	tPanel:'',
	width:100,
	height:100,
	selLayer:'',		
	execUrl:function(url, callback){
		Ext.Ajax.request({
				url:url,
				success: function(response){
					var obj = Ext.decode(response.responseText);					
					callback(obj)		
				}			
			});	
	
	},
	gCode:function(addr, callback){	  
				var geocoder = new google.maps.Geocoder();					
				geocoder.geocode({ 'address': addr }, function (results, status) {					
					if (status == google.maps.GeocoderStatus.OK) {		
						var xx=results[0].geometry.location.lng();			
						var yy=results[0].geometry.location.lat();		
						SourceDest={a:xx, b:yy};							
					}else{
						console.log("Geocoding failed: " + status); 
						Ext.Msg.alert("Geocoding failed", "Please enter location")
					}				
					callback(SourceDest);	
				})		
			},
	
	buildItems:function(){
		return[
			{
				xtype:'button',						
				tooltip:'Upload layer',
				icon:'./icons/upload.png',
				scale:'medium',
				handler:function(){
					var me = this.up('panel');
					var win = Ext.create('MyPath.UploadLayer', {
						mapContainer:me.map					})					
					win.show();	
					
				}	
			},
			{
				xtype:'button',
				tooltip:'Annotate',
				icon:'./icons/annotate.png',
				scale:'medium',
				handler:function(){				
					Ext.Msg.show({
						title: 'Annotation',
						msg: 'Please click a point on the map where you want to place your annotation',
						buttons: Ext.MessageBox.OK,
						fn:showResult,
					});
					
					function showResult(btn){						
						console.log(btn)
						
						
						if (btn=='ok'){
							
						}
					};
					
					
					/* var me = this.up('panel');
					var win = Ext.create('MyPath.Annotate', {
						mapContainer:me.map					})					
					win.show();	 */
					
				}	
			},
				{
				xtype:'button',
				tooltip:'Download map',
				icon:'./icons/download.png',
				scale:'medium',
				handler:function(){
					var me = this.up('panel');
					var win = Ext.create('MyPath.UploadLayer', {
						mapContainer:me.map					})					
					win.show();	
					
				}	
			}
		
		]
	},
	
	
	
	initComponent:function(){		
	
		var popup, me=this 			
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),					
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.MousePosition(),
					new OpenLayers.Control.LayerSwitcher(),
										
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		        
       var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					//displayInLayerSwitcher: false,				
				}
		);
			
			
		var Location = new OpenLayers.Layer.Vector('My Location', {
		 displayInLayerSwitcher: false,		
		});	

		var Location2 = new OpenLayers.Layer.Vector('Gcode', {
		 displayInLayerSwitcher: false,		
		});			
		
		
		
		map.addLayers([pgp_basemap_cache, Location, Location2]);		
		map.zoomToMaxExtent()		
		
		
		
		map.events.register("mousemove", map, function (e) {            
			/* var point = map.getLonLatFromPixel( this.events.getMousePosition(e) )     
			//console.log(point.lon, point.lat)
			var pos = new OpenLayers.LonLat(point.lon,point.lat).transform('EPSG:900913', 'EPSG:4326');
			console.log(pos);*/
			OpenLayers.Strategy.Refresh
		}); 
		
		
		
		map.events.register('click', map, function(e){		
			
			var point = map.getLonLatFromPixel( this.events.getMousePosition(e) )     
			var pos = new OpenLayers.LonLat(point.lon,point.lat).transform('EPSG:900913', 'EPSG:4326');
			
		
		});  
		
		Ext.apply(this, {
			map:map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'left',
				  items: this.buildItems(),
				}
			]			
		});		
		this.callParent();   
    }	
	
	
});


