$.ajaxSetup({
	headers: { 'X-CSRFToken': csrf_token },
	type: 'POST',
});

$(document).ready(function(){

	$("#trans_area").hide();

	$('#btn_search').click(function(){
		if($("#search_content").attr('placeholder') == "Plaese input Gene ID"){
			
			$("#trans_area").hide();
			
			// 在資料庫中得到gene id搜尋結果
			// $.ajax({
			// 	headers: { 'X-CSRFToken': csrf_token },
			// 	type: 'POST',
			// 	url: '/web_tool/ajax_data/', 
			// 	data: $('#search_content').serialize(), //在input 的地方需要加入name:gene_id 否則此處會錯誤
			// 	success: function(response){ 
			// 		$("#text1").text( $("#search_content").val() );
			// 		$("#text2").text( response.message );
			// 		$("#text3").text( response.message2 );
			// 	},
			// 	error: function(){
			// 		alert('Something error');
			// 	},
			// });

			// 利用爬蟲取得gene id 結果（包含non cds）
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				type: 'POST',
				url: '/web_tool/crawler_gene/', 
				data: $('#search_content').serialize(), //在input 的地方需要加入name:gene_id 否則此處會錯誤
				success: function(response){ 
					$("#text1").text( $("#search_content").val() );
					$("#all_trans_table").css("display","block")
					var data_transname = response[0];
					var data_type = response[1];
					var data_Tlen = response[2];
					var data_CDS = response[3];
					var data_Clen = response[4];
					var data_Protein = response[5];
					var data_Plen = response[6];
					var dataset = [];
					
					// $('#all_trans_table').append("<tbody>");
					for(var i = 0; i < data_transname.length; i++){
						dataset.push(
							[
								data_transname[i],
								data_type[i],
								data_Tlen[i],
								data_CDS[i],
								data_Clen[i],
								data_Protein[i],
						 		data_Plen[i],
							]
						)
					}
					$("#all_trans_table").DataTable({
						destroy : true,
						data: dataset,
						// <td></td>
                        //     <td>Type</td>
                        //     <td>Transcript Length (nt)</td>
                        //     <td>Coding Sequence (CDS)</td>
                        //     <td>Coding Sequence Length (nt)	</td>
                        //     <td>Protein</td>
                        //     <td>Protein Length (aa)</td>
						
						
						columns:[
							{ title: 'Transcript'},
							{ title: 'type'},
							{ title: 'Transcript Length (nt)'},
							{ title: 'Coding Sequence (CDS)'},
							{ title: 'Coding Sequence Length (nt)'},
							{ title: 'Protein'},
							{ title: 'Protein Length (aa)'},
							// { data: 'data_transname'},
							// { data: 'data_type'},
							// { data:  'data_Tlen'},
							// { data:  'data_CDS'},
							// { data: 'data_Clen'},
							// { data: 'data_Protein'},
							// { data: 'data_Plen'}
						],
						columnDefs: [{
							//   指定第一列，從0開始，0表示第一列，1表示第二列……
							targets: 0,
							render: function(data, type, row, meta) {
								return '<button class = "btn btn-info" value = "'+ row[1] + '" />'  + data +  '</button>'
							}
						}],
					});

				},
				error: function(){
					alert('Finding Gene id data error');
				},
			});
		}
		else if($("#search_content").attr('placeholder') == "Plaese input Transcript ID"){
			$("#seq1").html("")
			$("#seq2").html("")
			$("#seq3").html("")
			$("#trans_table").html("")
			$(".spinner-grow").show()
			$("#chart1_area").html("")
			$("#chart2_1area").html("")
			$("#chart2_2area").html("")

			//執行網路爬蟲擷取並處理檔案
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				type: 'POST',
				url: '/web_tool/crawler_and_processing/', 
				data: $('#search_content').serialize(),
				async: false, //使後方程式需要等此程式完全跑完後才繼續進行
				success: function(response){
					var seq1 = response[0];
					var seq1_color = response[1];
					var seq2 = response[2];
					var seq2_color = response[3];
					var length1 = seq1.length;
					var length2 = seq2.length;
					var seq3 = [];
					// seq1的序列圖
					for(var i = 0; i < length1; i++){
						if (i == 0){
							var num = i+1
							$("#seq1").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						else if(i % 70 == 0){
							var num = i+1
							$("#seq1").append("<br>");
							if(num > 1000){
								$("#seq1").append("<span>" + num + "\&ensp;" + "</span>");
							}
							else if(num > 100){
								$("#seq1").append("<span>" + num + "\&ensp;" + "\&ensp;" + "</span>");
							}
							else if(num >10){ 
								$("#seq1").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
							}
						}
						else if(i%10 == 0){
							$("#seq1").append("\&ensp;"+ "\&ensp;");
						}
						
						if(seq1_color[i] == "5'UTR" || seq1_color[i] == "3'UTR"){
							$("#seq1").append("<span class=\"UTR\">"+seq1[i]+"</span>");
						}
						else if(seq1_color[i] == "Exon_orange"){
							$("#seq1").append("<span class= \"Exon_orange\" >" + seq1[i] + "</span>");
						}
						else if(seq1_color[i] == "Exon_yellow"){
							$("#seq1").append("<span class= \"Exon_yellow\" >" + seq1[i] + "</span>");
						}
						else{
							$("#seq1").append("<span class = \"Intron\" >" + seq1[i] + "</span>");
						}
					}
					// seq2 的序列圖
					for(var i = 0; i < length2; i++){
						if (i == 0){
							var num = i+1
							$("#seq2").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						else if(i % 70 == 0){
							var num = i+1
							$("#seq2").append("<br>");
							if(num > 1000){
								$("#seq2").append("<span>" + num + "\&ensp;" + "</span>");
							}
							else if(num > 100){
								$("#seq2").append("<span>" + num + "\&ensp;" + "\&ensp;" + "</span>");
							}
							else if(num >10){ 
								$("#seq2").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
							}
						}
						else if(i%10 == 0){
							$("#seq2").append("\&ensp;"+ "\&ensp;");
						}
						
						if(seq2_color[i] == "5'UTR" || seq2_color[i] == "3'UTR"){
							$("#seq2").append("<span class=\"UTR\">"+seq2[i]+"</span>");
						}
						else if(seq2_color[i] == "Exon_orange"){
							$("#seq2").append("<span class= \"Exon_orange\" >" + seq2[i] + "</span>");
						}
						else if(seq2_color[i] == "Exon_yellow"){
							$("#seq2").append("<span class= \"Exon_yellow\" >" + seq2[i] + "</span>");
						}
					}
					//seq3 的序列圖
					var num = 0;
					for(var i = 0; i < length2; i++){
						if(i == 0){
							var first = i+1
							$("#seq3").append("<span>" + first  + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						if(num != 0){
							
							if( num %60 == 0){
								$("#seq3").append("<br>");
								
								if(num > 1000){
									num_string = num+1
									$("#seq3").append("<span>" + num_string + "\&ensp;" + "</span>");
								}
								else if(num > 100){
									num_string = num+1
									$("#seq3").append("<span>" + num_string + "\&ensp;" + "\&ensp;" + "</span>");
								}
								else if(num >10){ 
									num_string = num+1
									$("#seq3").append("<span>" + num_string + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
								}
							}
							else if( num % 3 == 0){
								$("#seq3").append("\&ensp;" + "\&ensp;")
							}
						}
						
						
						if(seq2_color[i] == "Exon_orange"){
							$("#seq3").append("<span class = \"Conceptual \" >" + seq2[i] + "</span>");
							num = num+1; 
						}
						else if(seq2_color[i] == "Exon_yellow"){
							$("#seq3").append("<span class = \"Conceptual \" >" + seq2[i] + "</span>");
							num = num+1;
						}
					}
					
				},
				error:function(){
					alert("crawler_and_processing error")
				}
				
				
			}) 

			// //執行網路爬蟲下載檔案
			// $.ajax({
			// 	headers: { 'X-CSRFToken': csrf_token },
			// 	type: 'POST',
			// 	url: '/web_tool/crawler/', 
			// 	data: $('#search_content').serialize(),
			// 	async: false, //使後方程式需要等此程式完全跑完後才繼續進行
			// }) 
			
			// //處理資料並匯出檔案
			// $.ajax({
			// 	headers: { 'X-CSRFToken': csrf_token },
			// 	type: 'POST',
			// 	url: '/web_tool/hw_23/', 
			// 	data: $('#search_content').serialize(),
			// 	async: false,
			// }) 
			// $.ajax({
			// 	headers: { 'X-CSRFToken': csrf_token },
			// 	type: 'POST',
			// 	url: '/web_tool/hw_4/', 
			// 	data: $('#search_content').serialize(),
			// 	async: false,
			// }) 
			
			//利用d3劃出結構圖
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				url: '/web_tool/d3_graph/', 
				type: 'POST',
				data: $('#search_content').serialize(),
				async: false,
				success: function(response){ 
					var name1 = response[0];
					var name2 = response[1];
					var start1 = response[2];
					var start2 = response[3];
					var end1 = response[4];
					var end2 = response[5];
					var len1 = response[6];
					var len2 = response[7];
					
					//繪製第一章d3結構圖
					// total_len1 = 0;
					// for(var i =0; i < len1.length; i++){
					// 	if(name1[i] == "3'UTR" || name1[i] == "5'UTR"){
					// 		continue;
					// 	}
					// 	total_len1 += len1[i];
					// }
		
					// var svg = d3.select(".chart1_1")
					// 			.append("svg")
					// 			.attr("width", 800)
					// 			.attr("height", 25)
					// 			.attr("fill","black")
					// 			.attr("style", "outline: thin solid black;");
		
					// if( name1[ len1.length - 1] == "3'UTR"){
					// 	var width = 800 * len1[len1.length - 1]/total_len1 ;
					// 	var height = 25;
					// 	svg.append("rect")
					// 		.attr("x", 800 * (start1[len1.length - 1])/total_len1)
					// 		.attr("y", 0 )
					// 		.attr("width", width)
					// 		.attr("height", height)
					// }
		
					// for(var i =0; i < len1.length; i++){
						
					// 	var width = 800 * len1[i]/total_len1 ;
					// 	var height = 25;
						
					// 	if( name1[i] == "5'UTR"){
					// 		svg.append("rect")
					// 			.attr("x", 800 * (start1[i])/total_len1)
					// 			.attr("y", 0 )
					// 			.attr("width", width)
					// 			.attr("height", height)	
					// 	}
					// 	if(name1[i][0] == "E" ){
							
					// 		var x = parseInt(name1[i][name1[i].length -1]);
					// 		if (x % 2 == 0){
					// 			svg.append("rect")
					// 				.attr("x", 800 * (start1[i])/total_len1)
					// 				.attr("y", 0 )
					// 				.attr("width", width)
					// 				.attr("height", height)
					// 				.attr("fill", "orange");
					// 		}
					// 		else{
					// 			svg.append("rect")
					// 				.attr("x", 800 * (start1[i])/total_len1)
					// 				.attr("y", 0 )
					// 				.attr("width", width)
					// 				.attr("height", height)
					// 				.attr("fill", "yellow");
					// 		}
					// 	}
		
					// 	if(name1[i][0] == "I" ){
					// 		svg.append("rect")
					// 			.attr("id", name1[i])
					// 			.attr("x", 800 * (start1[i])/total_len1)
					// 			.attr("y", 0 )
					// 			.attr("width", width)
					// 			.attr("height", height)
					// 			// .attr("stroke", "black")
					// 			.attr("fill", "white");		
					// 	}
					// }
		
					// const tooltip = d3.select(".chart1_1")
					// 		.append("div")
					// 		.style("position", "absolute")
					// 		.style("visibility", "hidden") // 一開始tooltips是隱藏的
					// 		.style("background-color", "white")
					// 		.style("border", "solid")
					// 		.style("border-width", "1px")
					// 		.style("border-radius", "5px")
					// 		.style("padding", "10px")
					// 		.html(
					// 				"<p>" + name1[3] + "</p>" +
					// 				"<p>" + start1[3] + " - " + end1[3] +"</p>" +
					// 				"<p>" + len1[3] +"</p>"
					// 			);
		
					// d3.select("#Intron3")
					// 	.style('cursor', 'pointer')
					// 	.on('mouseover', function() {
					// 		return tooltip.style("visibility", "visible")
					// 		})
					// 	.on("mousemove", function() {
					// 		// 設定 tooptip位置
					// 		return tooltip.style("top", "5px").style("left","5px")
					// 		})
					// 	.on('mouseleave', function(){
					// 		return tooltip.style("visibility", "hidden")
					// 		});
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					// 圖1整組資料綁製svg
					total_len1 = 0;
					for(var i =0; i < len1.length; i++){
						if(name1[i] == "3'UTR" || name1[i] == "5'UTR"){
							continue;
						}
						total_len1 += len1[i];
					}
		
					var tooltipData = [];
					if( name1[ len1.length - 1] == "3'UTR"){
						tooltipData.push({
							"x": 800 * (start1[len1.length - 1] -1 )/total_len1,
							"y": 0,
							"start": start1[len1.length - 1],
							"end": end1[len1.length - 1],
							"name": name1[len1.length - 1],
							"len": len1[len1.length - 1],
							"width": 800 * len1[len1.length - 1]/total_len1,
							"height": 25,
							"color":"grey",
						})
					}
		
					for(var i = 0; i < len1.length; i++ ){
						var color = "white"
						if(name1[i] == "3'UTR"){
							continue;
						}
						if(name1[i] == "5'UTR"){
							color = "grey"
						}
						else if( name1[i][0] == "E" ){
							var x = parseInt(name1[i][name1[i].length -1]);
							if (x % 2 == 0){
								color = "orange";
							}
							else{
								color = "yellow";
							}
						}
		
						tooltipData.push({
							"x": 800 * (start1[ i ] -1 )/total_len1,
							"y": 0,
							"start": start1[ i ],
							"end": end1[i],
							"name": name1[i],
							"len": len1[i],
							"width": 800 * len1[i]/total_len1,
							"height": 25,
							"color": color,
						})
					}
					// console.log(tooltipData);
		
					d3.select('.chart1_1').style('position', 'relative')
		
					const dots = d3.select('.chart1_1')
							  .append('svg')
							  .attr('width', 800)
							  .attr('height', 25)
							  .attr("style", "outline: thin solid black;")
							  .selectAll('rect')
							  .data(tooltipData)
							  .enter()
							  .append('rect')
							  .attr("x", d => d.x)
							  .attr("y", d => d.y )
							  .attr("width", d => d.width )
							  .attr("height", d => d.height )
							  .attr("fill", d => d.color)
							  .attr("style", "outline: thin solid black;")
							  .style('cursor', 'pointer');
		
					// 建立tooltips
					const tooltips = d3.select(".chart1_1")
										.append("div")
										.style("opacity", 0)
										.style('position', 'absolute')
										.attr("class", "tooltip")
										.style("background-color", "white")
										.style("border", "solid")
										.style("border-width", "2px")
										.style("border-radius", "5px")
										.style("padding", "5px")
					
					dots.on('mouseover', function(){
						tooltips.style("opacity", 1) // 顯示tooltip
						})
						.on('mousemove', function(d){
							let pt = d3.pointer(this) // 抓圓點位置
							tooltips.style("opacity", 1)
								.style('left',  (d.target.__data__.x + 0.5*(d.target.__data__.width) + 240 ) + "px" ) // 設定tooltips位置
								// .style('top',  parseInt(d.target.__data__.y) )
								.html(
									"<p>" + "name: " + d.target.__data__.name + "</p>" + 
									"<p>" +  d.target.__data__.start + " - " +  d.target.__data__.end + "</p>" +
									"<p>" + "length: " +  d.target.__data__.len + "</p>"
								) // 抓到綁定在DOM元素的資料
						})
						.on('mouseleave', function(){
							// 滑鼠離開圖形時，tooltip消失
							tooltips.style("opacity", 0)
						})
		
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
						// 圖2 整組資料綁製svg
						var tooltipData2 = [];
						total_len2 = 0;
						for(var i =0; i < len2.length; i++){
							if(name2[i] == "3'UTR" || name2[i] == "5'UTR" || name2[i] == "CDS"){
								total_len2 += len2[i];
							}
						}
		
						for(var i = 0; i < len2.length; i++ ){
							var color = "grey";
		
							if(name2[i] == "5'UTR" || name2[i] == "3'UTR"){
								color = "grey"
								tooltipData2.push({
									"x": 800 * (start2[i] -1 )/total_len2,
									"y": 0,
									"start": start2[ i ],
									"end": end2[i],
									"name": name2[i],
									"len": len2[i],
									"width": 800 * len2[i]/total_len2,
									"height": 25,
									"color": color,
								})
							}
							else if( name2[i] == "CDS" ){
								color = "green"
								tooltipData2.push({
									"x": 800 * (start2[i] -1 )/total_len2,
									"y": 0,
									"start": start2[i],
									"end": end2[i],
									"name": name2[i],
									"len": len2[i],
									"width": 800 * len2[i]/total_len2,
									"height": 25,
									"color": color,
								})
							}
							else{
								continue;
							}
		
							
						}
						// console.log(tooltipData);
		
						d3.select('.chart2_1').style('position', 'relative')
		
						const dots2 = d3.select('.chart2_1')
								.append('svg')
								.attr('width', 800)
								.attr('height', 25)
								.attr("style", "outline: thin solid black;")
								.selectAll('rect')
								.data(tooltipData2)
								.enter()
								.append('rect')
								.attr("x", d => d.x)
								.attr("y", d => d.y )
								.attr("width", d => d.width )
								.attr("height", d => d.height )
								.attr("fill", d => d.color)
								.attr("style", "outline: thin solid black;")
								.style('cursor', 'pointer');
		
						// 建立tooltips
						const tooltips2 = d3.select(".chart2_1")
											.append("div")
											.style("opacity", 0)
											.style('position', 'absolute')
											.attr("class", "tooltip2")
											.style("background-color", "white")
											.style("border", "solid")
											.style("border-width", "2px")
											.style("border-radius", "5px")
											.style("padding", "5px")
						
						dots2.on('mouseover', function(){
							tooltips2.style("opacity", 1) // 顯示tooltip
							})
							.on('mousemove', function(d){
								let pt = d3.pointer(this) // 抓圓點位置
								tooltips2.style("opacity", 1)
									.style('left',  (d.target.__data__.x + d.target.__data__.width / 2) +240 + "px" ) // 設定tooltips位置
									// .style('top',  parseInt(d.target.__data__.y) )
									.html(
										"<p>" + "name: " + d.target.__data__.name + "</p>" + 
										"<p>" +  d.target.__data__.start + " - " +  d.target.__data__.end + "</p>" +
										"<p>" + "length: " +  d.target.__data__.len + "</p>"
									) // 抓到綁定在DOM元素的資料
							})
							.on('mouseleave', function(){
								// 滑鼠離開圖形時，tooltip消失
								tooltips2.style("opacity", 0)
							})

						/////////////////////////////////////////////////////////
						// 圖2-2 整組資料綁製svg
			
						var tooltipData2_2 = [];
						if( name2[ len2.length - 1] == "3'UTR"){
							tooltipData.push({
								"x": 800 * (start2[len2.length - 1] -1 )/total_len2,
								"y": 0,
								"start": start2[len2.length - 1],
								"end": end2[len2.length - 1],
								"name": name2[len2.length - 1],
								"len": len2[len2.length - 1],
								"width": 800 * len2[len2.length - 2]/total_len2,
								"height": 25,
								"color":"grey",
							})
						}
						
						for(var i = 0; i < len2.length; i++ ){
							var color = "orange"
							if(name2[i] == "3'UTR" || name2[i] == "CDS"){
								continue;
							}
							if(name2[i] == "5'UTR"){
								color = "grey"
							}
							
							var x = parseInt(name2[i][name2[i].length -1]);
							if (x % 2 != 0){
								color = "yellow";
							}
							
							tooltipData2_2.push({
								"x": 800 * (start2[i] -1 )/total_len2,
								"y": 0,
								"start": start2[ i ],
								"end": end2[i],
								"name": name2[i],
								"len": len2[i],
								"width": 800 * len2[i]/total_len2,
								"height": 25,
								"color": color,
							})
						}
						d3.select('.chart2_2').style('position', 'relative')
		
						const dots2_2 = d3.select('.chart2_2')
								.append('svg')
								.attr('width', 800)
								.attr('height', 25)
								.attr("style", "outline: thin solid black;")
								.selectAll('rect')
								.data(tooltipData2_2)
								.enter()
								.append('rect')
								.attr("x", d => d.x)
								.attr("y", d => d.y )
								.attr("width", d => d.width )
								.attr("height", d => d.height )
								.attr("fill", d => d.color)
								.attr("style", "outline: thin solid black;")
								.style('cursor', 'pointer');
		
						// 建立tooltips
						const tooltips2_2 = d3.select(".chart2_2")
											.append("div")
											.style("opacity", 0)
											.style('position', 'absolute')
											.attr("class", "tooltip2_2")
											.style("background-color", "white")
											.style("border", "solid")
											.style("border-width", "2px")
											.style("border-radius", "5px")
											.style("padding", "5px")
						
						dots2_2.on('mouseover', function(){
							tooltips2_2.style("opacity", 1) // 顯示tooltip
							})
							.on('mousemove', function(d){
								let pt = d3.pointer(this) // 抓圓點位置
								tooltips2_2.style("opacity", 1)
									.style('left',  (d.target.__data__.x + d.target.__data__.width / 2) +240 + "px" ) // 設定tooltips位置
									// .style('top',  parseInt(d.target.__data__.y) )
									.html(
										"<p>" + "name: " + d.target.__data__.name + "</p>" + 
										"<p>" +  d.target.__data__.start + " - " +  d.target.__data__.end + "</p>" +
										"<p>" + "length: " +  d.target.__data__.len + "</p>"
									) // 抓到綁定在DOM元素的資料
							})
							.on('mouseleave', function(){
								// 滑鼠離開圖形時，tooltip消失
								tooltips2_2.style("opacity", 0)
							})
				},
				error : function(){
					alert("d3_graph 2-2  error")
				}
			})

			//利用highchart繪出基因圖
			// $.ajax({
			// 	headers: { 'X-CSRFToken': csrf_token },
			// 	type: 'POST',
			// 	url: '/web_tool/gene_strcture_graph/', 
			// 	data: $('#search_content').serialize(),
			// 	async: false,
			// 	success: function(response){
			// 		// alert(response[0])
			// 		//chart1
			// 		var data_UTR = response[0];
			// 		var data_Exon = response[1];
			// 		var data_Intron = response[2];
			// 		var data2_UTR = response[3];
			// 		var data2_Exon = response[4];
			// 		var data2_CDS = response[5];

			// 		var dataset = [];
			// 		var dataset2 = [];
			// 		// var label = [];
					
			// 		// for(var i = 0;i < data_Exon.length ; i++){
			// 		// 	label.push(data2_Exon[i][0]);
			// 		// }
					
			// 		for(var i = 0;i < data_UTR.length ; i++){
			// 			dataset.push({
						
			// 				x: data_UTR[i][1],
			// 				x2: data_UTR[i][2],
			// 				color: "#808080",
			// 				y: 0,
			// 			})
			// 		}

			// 		for(var i = 0;i < data_Exon.length ; i++){
			// 			if(i%2 == 0){
			// 				color = "#FFD700"
			// 			}
			// 			else{
			// 				color = "#FF7300"
			// 			};
			// 			dataset.push({
							
			// 				x: data_Exon[i][1],
			// 				x2: data_Exon[i][2],
			// 				// name: data_UTR[i][0],
			// 				y: 1,
			// 				color: color,
			// 			})
			// 		}

			// 		for(var i = 0;i < data_Intron.length ; i++){
			// 			dataset.push({
							
			// 				x: data_Intron[i][1],
			// 				x2: data_Intron[i][2],
			// 				// name: data_Intron[i][0],
			// 				y: 2,
			// 			})
			// 		}
			// 		//the chart
			// 		Highcharts.chart('chart1', {
			// 			chart: {
			// 			type: 'xrange'
			// 			},
			// 			title: {
			// 				text: 'transcript structure'
			// 			},
			// 			accessibility: {
			// 				point: {
			// 					descriptionFormatter: function (point) {
			// 					var ix = point.index + 1,
			// 						category = point.yCategory,
			// 						from = point.x,
			// 						to = point.x2;
			// 					return "123";
			// 					}
			// 				}
			// 			},
			// 			xAxis: {
			// 			},
			// 			yAxis: {
			// 				title: {
			// 					text: ''
			// 				},
			// 				categories: ['UTR', 'Exon', 'Intron'],
			// 				reversed: true
			// 			},
			// 			series: [{
			// 				name: 'structure',
			// 				borderColor: 'gray',
			// 				pointWidth: 20,
			// 				data: dataset,
			// 				dataLabels: {
			// 					enabled: true
			// 				}
			// 			}]
					
			// 		});	


			// 		for(var i = 0;i < data2_UTR.length ; i++){
			// 			dataset2.push({
			// 				name: data2_UTR[i][0],
			// 				x: data2_UTR[i][1],
			// 				x2: data2_UTR[i][2],
			// 				color: "#808080",
			// 				y: 0,
			// 			})
			// 		}

			// 		for(var i = 0;i < data2_Exon.length ; i++){
			// 			if(i%2 == 0){
			// 				color = "#FFD700"
			// 			}
			// 			else{
			// 				color = "#FF7300"
			// 			};
			// 			dataset2.push({
							
			// 				x: data2_Exon[i][1],
			// 				x2: data2_Exon[i][2],
			// 				y: 1,
			// 				color:color,
							
			// 			})
			// 		}

			// 		for(var i = 0;i < data2_CDS.length ; i++){
			// 			dataset2.push({
			// 				x: data2_CDS[i][1],
			// 				x2: data2_CDS[i][2],
			// 				y: 2,
			// 			})
			// 		}
					
			// 		//chart2
			// 		Highcharts.chart('chart2', {
			// 			chart: {
			// 			type: 'xrange'
			// 			},
			// 			title: {
			// 				text: 'transcript structure'
			// 			},
			// 			accessibility: {
			// 				point: {
			// 					descriptionFormatter: function (point) {
			// 					var ix = point.index + 1,
			// 						category = point.yCategory,
			// 						from = point.x,
			// 						to = point.x2;
			// 					return "123";
			// 					}
			// 				}
			// 			},
			// 			xAxis: {

			// 			},
			// 			yAxis: {
			// 				title: {
			// 					text: ''
			// 				},
			// 				categories: ['UTR', 'Exon', 'CDS'],
			// 				reversed: true
			// 			},
			// 			series: [{
			// 				name: 'structure',
			// 				borderColor: 'gray',
			// 				pointWidth: 20,
			// 				data: dataset2,
			// 				dataLabels: {
			// 					enabled: true
			// 				}
			// 			}]
					
			// 		});	

			// 	},
			// 	error: function(){
			// 		alert('gene_strcture_graph error');
			// 	}
			// }) 


			
			

			//從後端回傳資料並匯入datatable
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				url: '/web_tool/show_data/', 
				type: 'POST',
				data: $('#search_content').serialize(),
				success: function(response){ 
					$("#trans_area").show();
					$("#t1_container").hide();
					$("#t2_container").hide();
					$("#t3_container").hide();

					$("#text1").text( $("#search_content").val() );
					$("#text2").text( "" );
					$("#text3").text( "" );
					
					$("#table1_title").text("Unspliced + UTR ")
					$("#table1_title").addClass("alert alert-success")

					var body = response[0]

					const table1 = $("#table1").DataTable({
						
						// https://datatables.net/examples/ajax/objects.html
						// 調整各部件比例
						"dom" : "<'row'<'col-sm-6'l><'col-sm-6'f>>" 
							+"<'row'<'col-sm-12'tr>>" 
							+"<'row'<'col-sm-7'i><'col-sm-5'p>>",
						
						// searching: false, //搜尋功能, 預設是開啟
						// paging: false, //分頁功能, 預設是開啟
						destroy : true, //解决Cannot reinitialise DataTable問题
						data: body,
						columns:[
							{ title: 'Name' },
							{ title: 'Start' },
							{ title: 'End' },
							{ title: 'Length'}
						],
					});

					$("#table2_title").text("Spliced + UTR")
					$("#table2_title").addClass("alert alert-success")
					var body2 = response[1]

					$("#table2").DataTable({
						destroy : true,
						data: body2,
						columns:[
							{ title: 'Name' },
							{ title: 'Start' },
							{ title: 'End' },
							{ title: 'Length'}
						],
					});

					$("#table3_title").text("Conceptual translation")
					$("#table3_title").addClass("alert alert-success")
					var body3 = response[2][0];
					var length3 = body3.length;
					for(var i = 0; i < length3; i++){
						if (i == 0){
							var num = i+1
							$("#trans_table").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						else if(i % 20 == 0){
							var num = i+1
							$("#trans_table").append("<br>");
							if(num > 1000){
								$("#trans_table").append("<span>" + num + "\&ensp;" + "</span>");
							}
							else if(num > 100){
								$("#trans_table").append("<span>" + num + "\&ensp;" + "\&ensp;" + "</span>");
							}
							else if(num >10){ 
								$("#trans_table").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
							}
						}
						else if(i%10 == 0){
							$("#trans_table").append("\&ensp;"+ "\&ensp;");
						}

						$("#trans_table").append("<span class=\"trans_seq\">"+ body3[i] +"</span>")
					}
					
					// $("#table3").DataTable({
					// 	destroy : true,
					// 	data: body3,
					// 	columns:[
					// 		{ title: 'number' },
					// 		{ title: '' },
					// 		{ title: '' },
					// 		{ title: '' },
					// 		{ title: '' },
					// 		{ title: '' },
					// 	],
					// 	ordering : false,
					// });

					// const datastack = [];
					// for(var i =0, i< body.length, ){
					// 	dataset.push({
						
					// 	})
					// }
				},
				error: function(){
					alert('Something error');
				},
				
			}) 
			
			$(".spinner-grow").hide()
			var str = $("#search_content").val();
			// $("#text1_section").html('<div>'+ $("#search_content").val()+ '<br></div>');
		}
		else{
			$("#text1").text("Plaese Select search type");
		}
		// 如果是在程式執行中新增的按鈕要使用 需用js的用法
		$(document).on('click','.btn-info',function(e){
			var name = $(this).html();
			var type = $(this).val();
			// alert(type)
			// alert(name)
			// alert(type)
			$('#text1_section').html("<div>"+ name +"</div>")
			$("#seq1").html("")
			$("#seq2").html("")
			$("#seq3").html("")
			$("#trans_table").html("")
			$(".spinner-grow").show()
			$("#chart1_area").html("")
			$("#chart2_1area").html("")
			$("#chart2_2area").html("")
	
			//執行網路爬蟲擷取並處理檔案
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				type: 'POST',
				url: '/web_tool/crawler_and_processing/', 
				dataType: "json",
				data: {
					name: name,
					type: type,
				},
				async: false, //使後方程式需要等此程式完全跑完後才繼續進行
				success: function(response){
					var seq1 = response[0];
					var seq1_color = response[1];
					var seq2 = response[2];
					var seq2_color = response[3];
					var length1 = seq1.length;
					var length2 = seq2.length;
					var seq3 = [];
					// seq1的序列圖
					for(var i = 0; i < length1; i++){
						if (i == 0){
							var num = i+1
							$("#seq1").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						else if(i % 70 == 0){
							var num = i+1
							$("#seq1").append("<br>");
							if(num > 1000){
								$("#seq1").append("<span>" + num + "\&ensp;" + "</span>");
							}
							else if(num > 100){
								$("#seq1").append("<span>" + num + "\&ensp;" + "\&ensp;" + "</span>");
							}
							else if(num >10){ 
								$("#seq1").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
							}
							
							
						}
						else if(i%10 == 0){
							$("#seq1").append("\&ensp;"+ "\&ensp;");
						}
						
						if(seq1_color[i] == "5'UTR" || seq1_color[i] == "3'UTR"){
							$("#seq1").append("<span class=\"UTR\">"+seq1[i]+"</span>");
						}
						else if(seq1_color[i] == "Exon_orange"){
							$("#seq1").append("<span class= \"Exon_orange\" >" + seq1[i] + "</span>");
						}
						else if(seq1_color[i] == "Exon_yellow"){
							$("#seq1").append("<span class= \"Exon_yellow\" >" + seq1[i] + "</span>");
						}
						else{
							$("#seq1").append("<span class = \"Intron\" >" + seq1[i] + "</span>");
						}
					}
					// seq2 的序列圖
					for(var i = 0; i < length2; i++){
						if (i == 0){
							var num = i+1
							$("#seq2").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						else if(i % 70 == 0){
							var num = i+1
							$("#seq2").append("<br>");
							if(num > 1000){
								$("#seq2").append("<span>" + num + "\&ensp;" + "</span>");
							}
							else if(num > 100){
								$("#seq2").append("<span>" + num + "\&ensp;" + "\&ensp;" + "</span>");
							}
							else if(num >10){ 
								$("#seq2").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
							}
						}
						else if(i%10 == 0){
							$("#seq2").append("\&ensp;"+ "\&ensp;");
						}
						
						if(seq2_color[i] == "5'UTR" || seq2_color[i] == "3'UTR"){
							$("#seq2").append("<span class=\"UTR\">"+seq2[i]+"</span>");
						}
						else if(seq2_color[i] == "Exon_orange"){
							$("#seq2").append("<span class= \"Exon_orange\" >" + seq2[i] + "</span>");
						}
						else if(seq2_color[i] == "Exon_yellow"){
							$("#seq2").append("<span class= \"Exon_yellow\" >" + seq2[i] + "</span>");
						}
					}
					//seq3 的序列圖
					var num = 0;
					for(var i = 0; i < length2; i++){
						if(i == 0){
							var first = i+1
							$("#seq3").append("<span>" + first  + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
						}
						if(num != 0){
							
							if( num %60 == 0){
								$("#seq3").append("<br>");
								
								if(num > 1000){
									num_string = num+1
									$("#seq3").append("<span>" + num_string + "\&ensp;" + "</span>");
								}
								else if(num > 100){
									num_string = num+1
									$("#seq3").append("<span>" + num_string + "\&ensp;" + "\&ensp;" + "</span>");
								}
								else if(num >10){ 
									num_string = num+1
									$("#seq3").append("<span>" + num_string + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
								}
							}
							else if( num % 3 == 0){
								$("#seq3").append("\&ensp;" + "\&ensp;")
							}
						}
						
						
						if(seq2_color[i] == "Exon_orange"){
							$("#seq3").append("<span class = \"Conceptual \" >" + seq2[i] + "</span>");
							num = num+1; 
						}
						else if(seq2_color[i] == "Exon_yellow"){
							$("#seq3").append("<span class = \"Conceptual \" >" + seq2[i] + "</span>");
							num = num+1;
						}
					}
					
				},
				error:function(){
					alert("crawler_and_processing error")
				}
				
				
			}) 
			
			//利用d3劃出結構圖
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				url: '/web_tool/d3_graph/', 
				type: 'POST',
				dataType: "json",
				data: {
					name: name,
					type: type,
				},
				async: false,
				success: function(response){ 
					var name1 = response[0];
					var name2 = response[1];
					var start1 = response[2];
					var start2 = response[3];
					var end1 = response[4];
					var end2 = response[5];
					var len1 = response[6];
					var len2 = response[7];
		
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					// 圖1整組資料綁製svg
					total_len1 = 0;
					for(var i =0; i < len1.length; i++){
						if(name1[i] == "3'UTR" || name1[i] == "5'UTR"){
							continue;
						}
						total_len1 += len1[i];
					}
		
					var tooltipData = [];
		
					for(var i = 0; i < len1.length; i++ ){
						var color = "black";
						var y = 10;
						var h = 5;

						if(name1[i] == "3'UTR" || name1[i] == "5'UTR"){
							continue;
						}
						else if( name1[i][0] == "E" ){
							y = 0;
							h = 25;
							var x = parseInt(name1[i][name1[i].length -1]);
							if (x % 2 == 0){
								color = "orange";
							}
							else{
								color = "yellow";
							}
						}
						tooltipData.push({
							"x": 800 * start1[i]/total_len1,
							"y": y,
							"start": start1[i],
							"end": end1[i],
							"name": name1[i],
							"len": len1[i],
							"width": 800 * len1[i]/total_len1,
							"height": h,
							"color": color,
						})
					}
					// 處理5'utr 3'utr資料在後才能與exon資料重疊
					for(var i = 0; i < len1.length; i++ ){
						if(name1[i] == "3'UTR" || name1[i] == "5'UTR"){
							tooltipData.push({
								"x": 800 * start1[i]/total_len1,
								"y": 5,
								"start": start1[i],
								"end": end1[i],
								"name": name1[i],
								"len": len1[i],
								"width": 800 * len1[i]/total_len1,
								"height": 15,
								"color": "gray",
							})
						}
						else{
							continue;
						}
					}

					// console.log(tooltipData);
		
					d3.select('.chart1_1').style('position', 'relative')
		
					const dots = d3.select('.chart1_1')
								.append('svg')
								.attr('width', 800)
								.attr('height', 25)
								// .attr("style", "outline: thin solid black;")
								.selectAll('rect')
								.data(tooltipData)
								.enter()
								.append('rect')
								.attr("x", d => d.x)
								.attr("y", d => d.y )
								.attr("width", d => d.width )
								.attr("height", d => d.height )
								.attr("fill", d => d.color)
								// .attr("style", "outline: thin solid black;")
								.style('cursor', 'pointer');
		
					// 建立tooltips
					const tooltips = d3.select(".chart1_1")
										.append("div")
										.style("opacity", 0)
										.style('position', 'absolute')
										.attr("class", "tooltip")
										.style("background-color", "white")
										.style("border", "solid")
										.style("border-width", "2px")
										.style("border-radius", "5px")
										.style("padding", "5px")
					
					dots.on('mouseover', function(){
						tooltips.style("opacity", 1) // 顯示tooltip
						})
						.on('mousemove', function(d){
							let pt = d3.pointer(this) // 抓圓點位置
							tooltips.style("opacity", 1)
								.style('left',  (d.target.__data__.x + 0.5*(d.target.__data__.width) + 240 ) + "px" ) // 設定tooltips位置
								// .style('top',  parseInt(d.target.__data__.y) )
								.html(
									"<p>" + "name: " + d.target.__data__.name + "</p>" + 
									"<p>" +  d.target.__data__.start + " - " +  d.target.__data__.end + "</p>" +
									"<p>" + "length: " +  d.target.__data__.len + "</p>"
								) // 抓到綁定在DOM元素的資料
						})
						.on('mouseleave', function(){
							// 滑鼠離開圖形時，tooltip消失
							tooltips.style("opacity", 0)
						})
		
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
						// 圖2 整組資料綁製svg(utr + cds)
						total_len2 = 0;
						for(var i =0; i < len2.length; i++){
							if(name2[i] == "3'UTR" || name2[i] == "5'UTR" || name2[i] == "CDS"){
								total_len2 += len2[i];
							}
						}
						if (type == "['Coding transcript']"){
							var tooltipData2 = [];
							for(var i = 0; i < len2.length; i++ ){
								var color = "grey";
			
								if(name2[i] == "5'UTR" || name2[i] == "3'UTR"){
									color = "grey"
									tooltipData2.push({
										"x": 800 * (start2[i] -1 )/total_len2,
										"y": 0,
										"start": start2[ i ],
										"end": end2[i],
										"name": name2[i],
										"len": len2[i],
										"width": 800 * len2[i]/total_len2,
										"height": 25,
										"color": color,
									})
								}
								else if( name2[i] == "CDS" ){
									color = "green"
									tooltipData2.push({
										"x": 800 * (start2[i] -1 )/total_len2,
										"y": 0,
										"start": start2[i],
										"end": end2[i],
										"name": name2[i],
										"len": len2[i],
										"width": 800 * len2[i]/total_len2,
										"height": 25,
										"color": color,
									})
								}
								else{
									continue;
								}
							}
							// console.log(tooltipData);
			
							d3.select('.chart2_1').style('position', 'relative')
			
							const dots2 = d3.select('.chart2_1')
									.append('svg')
									.attr('width', 800)
									.attr('height', 25)
									// .attr("style", "outline: thin solid black;")
									.selectAll('rect')
									.data(tooltipData2)
									.enter()
									.append('rect')
									.attr("x", d => d.x)
									.attr("y", d => d.y )
									.attr("width", d => d.width )
									.attr("height", d => d.height )
									.attr("fill", d => d.color)
									// .attr("style", "outline: thin solid black;")
									.style('cursor', 'pointer');
							
							// 建立tooltips
							const tooltips2 = d3.select(".chart2_1")
												.append("div")
												.style("opacity", 0)
												.style('position', 'absolute')
												.attr("class", "tooltip2")
												.style("background-color", "white")
												.style("border", "solid")
												.style("border-width", "2px")
												.style("border-radius", "5px")
												.style("padding", "5px")
							
							dots2.on('mouseover', function(){
								tooltips2.style("opacity", 1) // 顯示tooltip
								})
								.on('mousemove', function(d){
									let pt = d3.pointer(this) // 抓圓點位置
									tooltips2.style("opacity", 1)
										.style('left',  (d.target.__data__.x + d.target.__data__.width / 2) +240 + "px" ) // 設定tooltips位置
										// .style('top',  parseInt(d.target.__data__.y) )
										.html(
											"<p>" + "name: " + d.target.__data__.name + "</p>" + 
											"<p>" +  d.target.__data__.start + " - " +  d.target.__data__.end + "</p>" +
											"<p>" + "length: " +  d.target.__data__.len + "</p>"
										) // 抓到綁定在DOM元素的資料
								})
								.on('mouseleave', function(){
									// 滑鼠離開圖形時，tooltip消失
									tooltips2.style("opacity", 0)
								})
						}
						/////////////////////////////////////////////////////////
						// 圖2-2 整組資料綁製svg
			
						var tooltipData2_2 = [];
						if( name2[ len2.length - 1] == "3'UTR"){
							tooltipData.push({
								"x": 800 * (start2[len2.length - 1] -1 )/total_len2,
								"y": 0,
								"start": start2[len2.length - 1],
								"end": end2[len2.length - 1],
								"name": name2[len2.length - 1],
								"len": len2[len2.length - 1],
								"width": 800 * len2[len2.length - 2]/total_len2,
								"height": 25,
								"color":"grey",
							})
						}
						
						for(var i = 0; i < len2.length; i++ ){
							var color = "orange"
							if(name2[i] == "3'UTR" || name2[i] == "CDS"){
								continue;
							}
							if(name2[i] == "5'UTR"){
								color = "grey"
							}
							
							var x = parseInt(name2[i][name2[i].length -1]);
							if (x % 2 != 0){
								color = "yellow";
							}
							
							tooltipData2_2.push({
								"x": 800 * (start2[i] -1 )/total_len2,
								"y": 0,
								"start": start2[ i ],
								"end": end2[i],
								"name": name2[i],
								"len": len2[i],
								"width": 800 * len2[i]/total_len2,
								"height": 25,
								"color": color,
							})
						}
						// 處理5'utr 3'utr資料在後才能與exon資料重疊
						for(var i = 0; i < len2.length; i++ ){
							if(name2[i] == "3'UTR" || name2[i] == "5'UTR"){
								tooltipData2_2.push({
									"x": 800 * (start2[ i ] -1 )/total_len2,
									"y": 5,
									"start": start2[ i ],
									"end": end2[i],
									"name": name2[i],
									"len": len2[i],
									"width": 800 * len2[i]/total_len2,
									"height": 15,
									"color": "gray",
								})
							}
							else{
								continue;
							}
						}

						d3.select('.chart2_2').style('position', 'relative')
		
						const dots2_2 = d3.select('.chart2_2')
								.append('svg')
								.attr('width', 800)
								.attr('height', 25)
								// .attr("style", "outline: thin solid black;")
								.selectAll('rect')
								.data(tooltipData2_2)
								.enter()
								.append('rect')
								.attr("x", d => d.x)
								.attr("y", d => d.y )
								.attr("width", d => d.width )
								.attr("height", d => d.height )
								.attr("fill", d => d.color)
								// .attr("style", "outline: thin solid black;")
								.style('cursor', 'pointer');
		
						// 建立tooltips
						const tooltips2_2 = d3.select(".chart2_2")
											.append("div")
											.style("opacity", 0)
											.style('position', 'absolute')
											.attr("class", "tooltip2_2")
											.style("background-color", "white")
											.style("border", "solid")
											.style("border-width", "2px")
											.style("border-radius", "5px")
											.style("padding", "5px")
						
						dots2_2.on('mouseover', function(){
							tooltips2_2.style("opacity", 1) // 顯示tooltip
							})
							.on('mousemove', function(d){
								let pt = d3.pointer(this) // 抓圓點位置
								tooltips2_2.style("opacity", 1)
									.style('left',  (d.target.__data__.x + d.target.__data__.width / 2) +240 + "px" ) // 設定tooltips位置
									// .style('top',  parseInt(d.target.__data__.y) )
									.html(
										"<p>" + "name: " + d.target.__data__.name + "</p>" + 
										"<p>" +  d.target.__data__.start + " - " +  d.target.__data__.end + "</p>" +
										"<p>" + "length: " +  d.target.__data__.len + "</p>"
									) // 抓到綁定在DOM元素的資料
							})
							.on('mouseleave', function(){
								// 滑鼠離開圖形時，tooltip消失
								tooltips2_2.style("opacity", 0)
							})
				},
				error : function(){
					alert("d3_graph 1  error")
				}
			})
	
			//資料回傳與繪製datatable
			$.ajax({
				headers: { 'X-CSRFToken': csrf_token },
				url: '/web_tool/show_data/', 
				type: 'POST',
				dataType: "json",
				data: {
					name: name,
					type: type,
				},
				success: function(response){ 
					$("#trans_area").show();
					$("#t1_container").hide();
					$("#t2_container").hide();
					$("#t3_container").hide();
	
					$("#text1").text( $("#search_content").val() );
					$("#text2").text( "" );
					$("#text3").text( "" );
					
					$("#table1_title").text("Unspliced + UTR ")
					$("#table1_title").addClass("alert alert-success")
	
					var body = response[0]
	
					const table1 = $("#table1").DataTable({
						"dom" : "<'row'<'col-sm-6'l><'col-sm-6'f>>" 
							+"<'row'<'col-sm-12'tr>>" 
							+"<'row'<'col-sm-7'i><'col-sm-5'p>>",
						destroy : true, //解决Cannot reinitialise DataTable問题
						data: body,
						columns:[
							{ title: 'Name' },
							{ title: 'Start' },
							{ title: 'End' },
							{ title: 'Length'}
						],
					});
	
					$("#table2_title").text("Spliced + UTR")
					$("#table2_title").addClass("alert alert-success")
					var body2 = response[1]
	
					$("#table2").DataTable({
						destroy : true,
						data: body2,
						columns:[
							{ title: 'Name' },
							{ title: 'Start' },
							{ title: 'End' },
							{ title: 'Length'}
						],
					});
					if(type == "['Coding transcript']"){
						alert("into coding")
						$("#table3_title").text("Conceptual translation")
						$("#table3_title").addClass("alert alert-success")
						var body3 = response[2][0];
						var length3 = body3.length;
						for(var i = 0; i < length3; i++){
							if (i == 0){
								var num = i+1
								$("#trans_table").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
							}
							else if(i % 20 == 0){
								var num = i+1
								$("#trans_table").append("<br>");
								if(num > 1000){
									$("#trans_table").append("<span>" + num + "\&ensp;" + "</span>");
								}
								else if(num > 100){
									$("#trans_table").append("<span>" + num + "\&ensp;" + "\&ensp;" + "</span>");
								}
								else if(num >10){ 
									$("#trans_table").append("<span>" + num + "\&ensp;" + "\&ensp;" + "\&ensp;" + "</span>");
								}
							}
							else if(i%10 == 0){
								$("#trans_table").append("\&ensp;"+ "\&ensp;");
							}
		
							$("#trans_table").append("<span class=\"trans_seq\">"+ body3[i] +"</span>")
						}
					};
					
				},
				error: function(){
					alert('Something error');
				},
				
			}) 
			
			$(".spinner-grow").hide()
			var str = $("#search_content").val();
	
		});
	});

	


	// 讓使用者決定要顯示的區塊
	$("#table1_title").click(function(){
		$('#t1_container').toggle()
	});
	$("#table2_title").click(function(){
		$('#t2_container').toggle()
	});
	$("#table3_title").click(function(){
		$('#t3_container').toggle()
	});

	// 挑選搜尋類別
	$("#gene_btn").click(function(){
		$("#search_content").attr('placeholder',"Plaese input Gene ID");
	});
	$("#trans_btn").click(function(){
		$("#search_content").attr('placeholder',"Plaese input Transcript ID");
	});

	// iframe 出現 and 消失
	$("#appear_iframe").click(function(){
		$("#moreinfo").slideDown();
	});
	$("#hide_iframe").click(function(){
		$("#moreinfo").slideUp();
	});
});