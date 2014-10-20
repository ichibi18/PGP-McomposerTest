

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
					var me = this.up('panel');					 
					 me.map.controls[5].activate();				 
				}	
			},
				{
				xtype:'button',
				tooltip:'Download map',
				icon:'./icons/download.png',
				scale:'medium',
				handler:function(){
					var me = this.up('panel');
					var win = Ext.create('MyPath.ExportMap', {
						map:me.map					})					
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
		
			style: new OpenLayers.StyleMap({'default':{
							strokeWidth: 5,
							strokeColor: '#005aff',
							label:'test'	
					}}),
			displayInLayerSwitcher: false,		
		});		
		
		map.addLayers([pgp_basemap_cache, Location, Location2]);		
		map.zoomToMaxExtent()				
		
		map.events.register("mousemove", map, function (e) {            
			
		}); 	
		
		//drag feature control
		var drag = new OpenLayers.Control.DragFeature(map.layers[2]);
		map.addControl(drag);
		
		
		//Insert label control
		var control = new OpenLayers.Control.DrawFeature(
			map.layers[2],
			OpenLayers.Handler.Point, {
			featureAdded: function(e) {
			    Ext.create('Ext.window.Window',{
				title:'test',
				items:[
						new Ext.form.FormPanel({
							items:[{
								padding:10,
								xtype: "textarea",
								name: "label",
								value: "",
								fieldLabel: "Text "
							},{
								xtype: "combo",
								store: [10,12,14,16,18,20,22,24,26,28,30],
								value:10,
								displayField: "fontsize",
								fieldLabel: "Font size ",
								typeAhead: true,
								mode: "local",
								triggerAction: "all",
								editable: false,
							}],
							buttons: [{
								text: "Ok",
								handler: function() {
									var me= this.up('form');
									var labelValue = me.items.items[0].getValue(); //get the typed  text
									var fontSize = me.items.items[1].getValue(); //:get the  selected font size
									e.style = {label: labelValue, labelSelect: true, fontSize:fontSize, fontColor:'#000000'}; //labelSelect allows to drag the text
									me.up('panel').close();									
									map.layers[2].redraw(); //Refresh needed to apply the label
									map.controls[5].deactivate();
									map.controls[4].activate();
								}
							}]
						})
				]			
			  }).show();			  
			}
		  }
		); 
		 map.addControl(control)
		
		//
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


