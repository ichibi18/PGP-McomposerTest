Ext.define('MyPath.ExportMap', {
	alias: 'widget.pgp_exportmap',
	extend: 'Ext.Window',	
	width: 250,
	layout: 'fit',
	modal: true,
	map: null,
	printMap: function(map, title, imageType, mapReadyCallback){

		var proxy = 'http://localhost:3000'//'/webapi/get.ashx?url=';
		
		// collect tile information
	    var size  = map.getSize();
	    var tiles = [];
		var legendUrls = [];
	    for (layername in map.layers) {
	        // if the layer isn't visible at this range, or is turned off, skip it
	        var layer = map.layers[layername];
	        if (!layer.getVisibility()) continue;
	        if (!layer.calculateInRange()) continue;
			
			
			// get legend
			if(layer instanceof OpenLayers.Layer.WMS) {
				legendUrls.push(layer.url + '?' + 
					'REQUEST=GetLegendGraphic&' +
					'VERSION=1.0.0&FORMAT=image/png&' +
					'LAYER=' + (layer.params.LAYERS||layer.PARAMS.LAYERS) + '&' +
					'LEGEND_OPTIONS=forcelabels:on;fontantialiasing:true;');
			}
			
	        tiles[layername] = [];
	        console.log('processing ' + layername);
			
	        // iterate through their grid's tiles, collecting each tile's extent and pixel location at this moment
	        for (tilerow in layer.grid) {
	            for (tilei in layer.grid[tilerow]) {
	                var tile = layer.grid[tilerow][tilei]
	                var url  = layer.getURL(tile.bounds);
					
					// BING hack
					if(url.substr(0,2) == '//'){
						url = 'http:' + url;
					}

	                //var url      = tile.url;
	                var position = tile.position;
	                var tilexpos = position.x;
	                var tileypos = position.y;
	                var opacity  = layer.opacity ? parseInt(100*layer.opacity) : 100;
	                console.log('adding ' + tiles.length + ' to ' + layername);
	                tiles[layername][tiles[layername].length] = { 
						url: url, 
						x: tilexpos, 
						y: tileypos, 
						opacity: opacity
					};
	            }
	        }
	    }
		
		var printConfig = {
			map: {
				w: map.size.w,
				h: map.size.h
			},
			tiles: tiles,
			legendUrls: legendUrls
		}
		console.log('printConfig',printConfig);



		var layerCanvases = [];
		var legendCanvases = [];
		
		for(legend in printConfig.legendUrls){
			legendCanvases[legend] = document.createElement('canvas');
		}

		for(layer in printConfig.tiles){
			layerCanvases[layer] = document.createElement('canvas');
			layerCanvases[layer].width = printConfig.map.w;
			layerCanvases[layer].height = printConfig.map.h;
		}
			
		var totalTiles = 0;
		for(layer in printConfig.tiles){
			totalTiles += printConfig.tiles[layer].length;
		}


		var imageLoadedCount = 0;
		function imageLoaded(){
			imageLoadedCount++;
			if(imageLoadedCount == (totalTiles + printConfig.legendUrls.length))
			{
				// all images loaded!
				console.log('all images loaded!');

				// compose main canvas
				var mainCanvas = document.createElement('canvas');
				
				var yOffset = 40; // account for title
				var xOffset = 0;

				mainCanvas.width = printConfig.map.w + xOffset;
				mainCanvas.height = printConfig.map.h + yOffset; // add 20px for map title

				var mainCanvasContext = mainCanvas.getContext('2d');

				mainCanvasContext.fillStyle = "#ffffff";
				mainCanvasContext.fillRect(0,0,mainCanvas.width,mainCanvas.height);

				// draw title
				mainCanvasContext.fillStyle = '#000000';
				mainCanvasContext.font = '16px Arial';
				mainCanvasContext.textAlign = 'center';
				mainCanvasContext.fillText(title, mainCanvas.width/2,25);

				// draw layers
				for(canvas in layerCanvases){
					mainCanvasContext.drawImage(layerCanvases[canvas],0,yOffset);
				}
				
				
				
				// TODO: implement drawing of legends
				// draw legends
				for(legend in legendCanvases){
					//mainCanvasContext.drawImage(legendCanvases[legend],layerCanvases[0].width, yOffset);
				}
				
				
				mainCanvasContext.fillStyle = 'rgba(0,0,0,1)';
				mainCanvasContext.strokeStyle = 'rgba(255,255,255,0.5)';
				mainCanvasContext.font = '10px Arial';
				
				// draw geoportal.gov.ph
				mainCanvasContext.textAlign = 'left'
				mainCanvasContext.fillText('http://geoportal.gov.ph', 10, mainCanvas.height - 10);
				mainCanvasContext.strokeText('http://geoportal.gov.ph', 10, mainCanvas.height - 10);
				
				
			
			
				mapReadyCallback({
					imageDataUri: mainCanvas.toDataURL('image/' + (imageType == 'PDF' ? 'JPEG' : imageType)),
					imageType: imageType,
					imageSize: {
						w: mainCanvas.width,
						h: mainCanvas.height
					}
				});
		
			}
		}
		
		var draw = function(tile, layerCanvas){

			if(tile.url == null){
				imageLoaded();
				return;
			}

			var image = new Image();

			//var url = proxy + escape(tile.url);
			var url =(tile.url);
			
			image.src = url;
			console.log('drawing ' + url);
			
			image.onload = function(){
				var context = layerCanvas.getContext('2d');
				context.globalAlpha = tile.opacity / 100;
				context.drawImage(this, tile.x, tile.y);
				imageLoaded();
			};
		};

		for(layer in printConfig.tiles){
			for(item in printConfig.tiles[layer]){
				var currentTile = printConfig.tiles[layer][item];
				draw(currentTile, layerCanvases[layer]);
				
			}
		}
		
		for(legend in printConfig.legendUrls){
			var image = new Image();
			
			var url = proxy + escape(printConfig.legendUrls[legend]);
			image.src = url;
			
			image.onload = function(){
				var context = legendCanvases[legend].getContext('2d');
				context.drawImage(this,0,0);
				imageLoaded();
			}
		}
		return null;
		
	},
	initComponent: function() {
		
		var me = this;
		
		Ext.apply(me, {
			
			items: [ 
				{ 	
					xtype: 'panel',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					defaults: {	
						margin: '10 5 5 5',
						labelWidth: 55,
					},
					items: [

						{
							xtype: 'combo',
							id: 'cmbType',
							editable: false,
							store: ['PNG','JPEG','PDF'],
							fieldLabel: 'Type',
							value: 'PNG'
						},
						{
							xtype: 'textarea',
							id: 'txtTitle',
							fieldLabel: 'Title',
							emptyText: 'enter title of the map'
						},
						{
							xtype: 'progressbar',
							id:'pbrComposing',
							width: 300,
							hidden: true
						},
						{
							xtype: 'button',
							id: 'btnExport',
							text: 'Generate download link',
							height: 30,
							handler: function(){
							
								var cmbType = Ext.getCmp('cmbType');
								var txtTitle = Ext.getCmp('txtTitle');
								
								me.printMap(me.map, txtTitle.getValue(), cmbType.getValue(), function(event){
									var downloadLink;
				
									if(event.imageType == 'PDF') {
										var doc = new jsPDF('l','mm','a4',true);
	
										//A4 is 210 x 297mm
										// 1 in = 25.4 mm
										// assuming 1 in = 72 px
										//1 mm approx 2.83464566929px
										var pxIn1mm = 2.83464566929;
											
										var imageRatio = event.imageSize.w/event.imageSize.h;

										var x = (((297*pxIn1mm)/2) - (event.imageSize.w/2)) / pxIn1mm;
										var y = (((210*pxIn1mm)/2) - (event.imageSize.h/2)) / pxIn1mm;
										var w = event.imageSize.w / pxIn1mm;
										var h = event.imageSize.h / pxIn1mm;
										
										if(x < 0 ){
											w = w - Math.abs(x * 2);
											h = w / imageRatio;
											x = (((297*pxIn1mm)/2) - ((w*pxIn1mm)/2)) / pxIn1mm;
											y = (((210*pxIn1mm)/2) - ((h*pxIn1mm)/2)) / pxIn1mm;
										}
										
										doc.addImage(event.imageDataUri, 'JPEG',x, y, w, h);
										downloadLink = doc.output('dataurlstring');
									} else {
										downloadLink = event.imageDataUri;
									}
									
									me.close();
									Ext.Msg.alert('Download link ready', 'Click this <a href="' + downloadLink + '" download="map.' + event.imageType.toLowerCase() + '">link</a> to download the map.');
									
								});

								var btnExport = Ext.getCmp('btnExport');
								btnExport.hide();
								
							    var pbrComposing = Ext.getCmp('pbrComposing');
								pbrComposing.show();
								
								pbrComposing.wait({
							        interval: 500,
							        increment: 15,
							        text: 'Composing map...',
							        scope: this
							    });
								
							}
						},
						{
							xtype: 'label',
							text: 'Exporting the map may take a while depending on network connectivity and number of layers loaded.'
							
						}
					
					]
				}
			]					
		});
		this.callParent();
	}
	
	
});
		