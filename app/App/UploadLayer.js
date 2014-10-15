	Ext.define('MyPath.UploadLayer',{
	extend: 'Ext.window.Window',	
	width:250,	
	height:120,	
	alias: 'widget.UploadLayer',			
	mapContainer:'',		
	//html: '<form action="/upload" enctype="multipart/form-data" method="post"><input name="title" type="text" /><input multiple="multiple" name="upload" type="file" /><input type="submit" value="/Upload" /></form>',//"<input id='inputFile' type='file' name='uploaded' />",		
	title:'Please select file to upload',	
	initComponent:function(){		
		this.items = this.buildItems();				
		//this.buttons = this.buildButtons()
		this.callParent();		
	},	
	buildItems:function(){		
		return[			
			Ext.create('Ext.form.Panel',{
			itemId:'fpanel',
			bodyPadding: 20,			
			width:380,			
			//frame: true,			
			//html:'<form action="http://localhost:3000/convert" enctype="multipart/form-data" method="post"><input name="title" type="text" /><input multiple="multiple" name="upload" type="file" /><input type="submit" value="Upload" /></form>',			
			//standardSubmit:true,			
			items:[{
					xtype:'filefield',
					name:'upload',	
					itemId:'up1',	
					width:190,
					allowBlank: false,
					listeners: {
						change: function(fld, value) {
							  var newValue = value.replace(/C:\\fakepath\\/g, '');
							  fld.setRawValue(newValue);
							  console.log(this.fileInputEl.dom.files[0]);
						}
					}					
				},
				{
					xtype:'button',				
					itemId:'Upload',
					text:'Upload',	
					handler:function(){		
						var me = this.up();
						var file = me.getComponent('up1').fileInputEl.dom.files[0];
						console.log(file);
						var form = me.getForm();				
						if(form.isValid()){		
							var me = this.up('form').up('panel');
							console.log(me);
							
							form.submit({		
							//Ext.Ajax.request({
								//url:'upload',							
								url:'http://ogre.adc4gis.com/convert',								
								isUpload:true,
								method:'POST',								
								waitMsg : 'Please wait..',								
								success: function(response, opts) {							
								  console.log(response)
								},  
								failure:function(response, opts){								
									console.log(opts.response.responseText)
									jsonfile=opts.response.responseText;								
									var geojson_format = new OpenLayers.Format.GeoJSON({
										'internalProjection': new OpenLayers.Projection("EPSG:900913"),//me.mapContainer.map.projection,
										'externalProjection': new OpenLayers.Projection("EPSG:4326")
									});
									
									
									var vectorLayer = new OpenLayers.Layer.Vector(file.name, {												
											projection: new OpenLayers.Projection("EPSG:4326"),
											//strategies: [new OpenLayers.Strategy.Fixed()],												
									})		
									
									vectorLayer.addFeatures(geojson_format.read(jsonfile));
									console.log(vectorLayer)
									me.mapContainer.addLayer(vectorLayer);	
									me.close();	
								}, 
								callback:function(response, opts){
									console.log(response)
								}	
							});
						} 
						
					}				
				}] 
			})
		];
		
	},
	buildButtons:function(){		
		return[{
			xtype:'button',				
			itemId:'Upload',
			text:'Upload',		
			handler:function(){		
				var form = this.up('panel').down('form').getForm();
				//var form = me.getForm();
				console.log(form);
				if(form.isValid()){
                form.submit({
                    url:'upload',
					method:'post',
					enctype:'multipart/form-data',
					processData:false,
                    waitMsg: 'Uploading your photo...',
                    success: function(fp, o) {
                        Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
					   console.log(fp)
                    }
                });
				}
				//***********
				
				
				
				/* var me = this.up('panel');
				var file = me.getComponent('bb').fileInputEl.dom.files[0]
				var formdata = new FormData();
				formdata.append('file', file, 'file');
				console.log(formdata)
				
				
				
				Ext.Ajax.request({
					method:'POST',					
					url:'upload',
					data:formdata,
					processData:false,
					enctype:'multipart/form-data',
					//params:{'files':file},			
					success: function(response, opts) {					
						console.log(response.responseText);
						//console.log(response);
					},
					callback: function(response, opts) {
						console.log('callback');
					}
				})
				me.close();	     */
				
			return
				/** code to upload GeoJson data
				**/
				var jsonfile = {
					"type": "FeatureCollection",
						"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
						"features": [
						{ "type": "Feature", "properties": { "Name": "", "Description": "" }, "geometry": { "type": "LineString", "coordinates": [ [ 118.000000776110255, 21.416667031549565 ], [ 118.000000776110255, 9.999999084805955 ], [ 116.000000610699018, 7.666667298385962 ], [ 117.00000069340463, 7.666667298385962 ], [ 117.425000391686297, 7.412500033924045 ], [ 117.966666541704782, 6.86666704589098 ], [ 117.966666541704782, 6.283333259714799 ], [ 118.333331891223921, 5.999999315899108 ], [ 118.833331932576726, 5.999999315899108 ], [ 119.583333117500032, 5.266667335594201 ], [ 119.000000858815866, 4.700000178633535 ], [ 119.000000858815866, 4.383333522876208 ], [ 120.000000941521492, 4.383333522876208 ], [ 120.000000941521492, 4.749999555317866 ], [ 126.999999274672604, 4.749999555317866 ], [ 126.999999274672604, 21.416667031549565 ], [ 118.000000776110255, 21.416667031549565 ] ] } }
						]
					}

				var geojson_format = new OpenLayers.Format.GeoJSON({
					'internalProjection': me.mapContainer.map.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				
				 var vectorLayer = new OpenLayers.Layer.Vector("GeoJSON", {												
						projection: new OpenLayers.Projection("EPSG:4326"),
						//strategies: [new OpenLayers.Strategy.Fixed()],												
				})		
				
				vectorLayer.addFeatures(geojson_format.read(jsonfile));
				console.log(vectorLayer)
				me.mapContainer.map.addLayer(vectorLayer);	
				
			}		
		}		
		
		];
	
	}
	
});




