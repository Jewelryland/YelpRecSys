function M_load_chart(){
	
	var selector = arguments[0] ? arguments[0] : "";
	
	var host = new URL(location.href).origin;
	
	$(selector + " .simple_line_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = {
	    				label:"line",
	    				data: eval(response)
	    		}
	    		var optopt = {"series": ["line"],"color": "#1ab394"}
	    		d3.flotBarLineWrap(itemid,data,optopt);
	    		
	    		}
			}
		);	
	});
	
	$(selector + " .simple_bar_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = {
	    				label:"bar",
	    				data: eval(response)
	    		}
	    		var optopt = {"series": ["bar"],"color": "#1ab394"}
	    		d3.flotBarLineWrap(itemid,data,optopt);
	    		
	    		}
			}
		);	
	});
	
	$(selector + " .simple_pie_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = eval(response);
	    		d3.flotPieWrap(itemid,data);
	    		}
			}
		);	
	});
	
	$(selector + " .spark_line_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		$("#"+itemid).sparkline(eval(response), {
	    	        type: 'line',
	    	        width: '100%',
	    	        height: '50',
	    	        lineColor: '#1ab394',
	    	        fillColor: "transparent"
	    	    });
	    		}
			}
		);	
	});
	
	$(selector + " .spark_pie_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		response = eval(response) ; 
	    		data = [response[0].data,response[1].data];
	    		$("#"+itemid).sparkline(data, {
                    type: 'pie',
                    height: '140',
                    sliceColors: ['#1ab394', '#F5F5F5']
                });
	    		}
			}
		);	
	});
	

	
	
	$(selector + " .china_map_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		var geoData = "";
		var options = [];
	
		d3.json("public/test_data/china_map_data.geojson", function (error1, geoData) {
	        d3.json("public/test_data/china_map_qudao.json", function(error2, data) {
	            var someChart = d3.chinaMapWrap(itemid, geoData, {"data": data,"max": 331063});
	        });
	    });
		
	});
	
	$(selector + " .bubble_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		var geoData = "";
		var options = [];
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = eval(response);
	    		d3.bubbleWrap(itemid,data);
	    		
	    		}
			}
		);	
	});
	
	$(selector + " .multi_line_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		var geoData = "";
		var options = [];
		d3.json(itemurl, function (error1, response) {
			
			var data = eval(response);
			d3.flotLineMultiWrap(itemid,data);
	    });
	});
	
	
//	radar chart
	$(selector + " .radar_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		var data = [
	    		        [
	    		         {"axis":"保温时长","value":0.22},
	    		         {"axis":"杯子样式","value":0.28},
	    		         {"axis":"材质","value":0.29},
	    		         {"axis":"适用对象","value":0.17},
	    		         {"axis":"容量","value":0.22},
	    		         {"axis":"颜色分类","value":0.02}
	    		       ],
	    		       [
	    		         {"axis":"保温时长","value":0.34},
	    		         {"axis":"杯子样式","value":0.28},
	    		         {"axis":"材质","value":0.19},
	    		         {"axis":"适用对象","value":0.22},
	    		         {"axis":"容量","value":0.17},
	    		         {"axis":"颜色分类","value":0.12}
	    		       ],
	    		       [
	    		         {"axis":"保温时长","value":0.27},
	    		         {"axis":"杯子样式","value":0.25},
	    		         {"axis":"材质","value":0.34},
	    		         {"axis":"适用对象","value":0.52},
	    		         {"axis":"容量","value":0.15},
	    		         {"axis":"颜色分类","value":0.1}
	    		       ]
	    		     ];
		if(itemurl != host){
			$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		data = eval(response);
	    		d3.radarWrap(itemid,data);
	    		}
			}
		);	
		}
		else{
			d3.radarWrap(itemid,data);
		}
	    	
	});
	
	
	
//	# neg_bar
	var zone = true;
	$(selector + " .neg_bar_char").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		
		var data_1 = [{"name":"高档保温杯不锈钢保温壶儿童保温瓶男女士创意水杯茶杯海贝丽杯子","value":1},
		        {"name":"爱暖儿正品不锈钢保温杯 男女士水杯子便携儿童杯学生水瓶保温壶","value":1},
		        {"name":"子弹头保温杯女士可爱儿童保温杯不锈钢学生水杯便携男士保温瓶","value":2},
		        {"name":"Wopu沃普高档保温杯 时尚男女士真空不锈钢水杯子 情侣车载茶杯","value":4},
		        {"name":"可爱卡通不锈钢保温杯大肚水杯 情侣杯子保温壶 保冷男士女士茶杯","value":-5},
		        {"name":"鸿利源保温杯 男女士高档便携水杯 不锈钢可爱创意学生定制茶杯子","value":-2},
		        {"name":"格莱达保温杯 男女士 不锈钢保温杯商务高档泡茶杯定制刻字水杯子","value":-1},
		        {"name":"高档保温杯 男女士真空不锈钢便携水杯儿童学生可爱保暖瓶茶杯子","value":-1},
		        {"name":"天喜保温杯女 学生可爱杯子不锈钢保温瓶儿童男 户外便携直身水杯","value":4},
		        {"name":"恩尔美保温杯男女儿童可爱不锈钢学生水杯子创意便携直身茶杯刻字","value":5},
		        {"name":"ONEDAY 子弹头保温杯不锈钢刻字 高档直身杯男女情侣便携水杯子瓶","value":-5}
		        ];
		var data_2 = [{"name":"山西","value":1},
		        {"name":"天津","value":3},
		        {"name":"湖南","value":-5},
		        {"name":"陕西","value":5},
		        {"name":"海外","value":-9},
		        {"name":"河北","value":13},
		        {"name":"辽宁","value":2},
		        {"name":"湖北","value":-8},
		        {"name":"山东","value":-1},
		        {"name":"江西","value":21},
		        {"name":"河南","value":13},
		        {"name":"四川","value":-34}
		        ];
		if(zone){
			d3.negBarWrap(itemid,data_1);
			zone = false;
		}
		else{
			d3.negBarWrap(itemid,data_2);
			zone = true;
		}
			
//		$.ajax({
//	    	type: 'GET',
//	    	url: itemurl,
//	    	async:true,
//	    	success: function(response){
//	    		data = eval(response);
//	    		d3.negBarWrap(itemid,data);
//	    		}
//			}
//		);	
	});
	
//	little tables_char
	$(selector + " .little_tables_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = eval(response);
	    		var str = '<table class="table table-striped"><thead><tr><th>#</th>   \
	    			<th>商品ID</th><th>商品名字</th><th>幅度</th>    \
	    			</tr>          \
                     </thead>';
	            str = str + '<tbody>';
	            var min_length = data.length < 5 ? data.length:5;
	            
	            for(var i =0 ;i<min_length;i++)
	            {
	            	str = str + '<tr>';
	            	str = str + '<td>' + (i+1) + '</td>';
	            	str = str + '<td>' + data[i]["itemid"] + '</td>';
	            	str = str + '<td>' + data[i]["title"] + '</td>';
	            	str = str + '<td>' + data[i]["zf"] + '</td>';
	            	str = str + '</tr>';
	            }
	            str = str +'</body></table>'
	            $("#"+itemid).append(str);

	    		}
			}
		);	
	});
	
//	big tables_char
	$(selector + " .big_tables_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = eval(response);
	    		var str = '<table class="table table-striped"><thead><tr><th>#</th>   \
	    			<th>日期</th><th>商品名字</th><th>价格</th>    \
	    			<th>30天内销量</th><th>总销售额</th>  \
	    			</tr>          \
                     </thead>';
	            str = str + '<tbody>';
	            var min_length = data.length < 10 ? data.length:10;
	            
	            for(var i =0 ;i<min_length;i++)
	            {
	            	str = str + '<tr>';
	            	str = str + '<td>' + (i+1) + '</td>';
	            	str = str + '<td>' + data[i]["updatetime"] + '</td>';
	            	str = str + '<td>' + data[i]["title"] + '</td>';
	            	str = str + '<td>' + data[i]["price"] + '</td>';
	            	str = str + '<td>' + data[i]["biz30day"] + '</td>';
	            	str = str + '<td>' + data[i]["total_fee"] + '</td>';
	            	str = str + '</tr>';
	            }
	            str = str +'</body></table>'
	            $("#"+itemid).append(str);

	    		}
			}
		);	
	});
	
	
	$(selector + " .tree_map_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		var geoData = "";
		var options = [];
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = eval("("+response+")");
	    		d3.treeMapWrap(itemid,data);
	    		}
			}
		);	
	});
	
	$(selector + " .gauge_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		var geoData = "";
		var options = [];
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		var data = eval("("+response+")");
	    		d3.e3GaugeWrap(itemid,
	    				{"label": "main", "selfData": data.children[0].size, "totalData": data.children[0].size + data.children[1].size}, 
	    		       	{"color": ['#1ab394', '#BABABA']}
	    		    );
	    		}
			}
		);	
	});
	
	
	$(selector + " .morris_line_chart").each(function(){
		var itemid = $(this).attr("id");
		var itemurl = host + $(this).attr("chart-url");
		$.ajax({
	    	type: 'GET',
	    	url: itemurl,
	    	async:true,
	    	success: function(response){
	    		Morris.Area({
	    	        element: itemid,
	    	        data: [{ period: '2010 Q1', iphone: 2666, ipad: null, itouch: 2647 },
	    	            { period: '2010 Q2', iphone: 2778, ipad: 2294, itouch: 2441 },
	    	            { period: '2010 Q3', iphone: 4912, ipad: 1969, itouch: 2501 },
	    	            { period: '2010 Q4', iphone: 3767, ipad: 3597, itouch: 5689 },
	    	            { period: '2011 Q1', iphone: 6810, ipad: 1914, itouch: 2293 },
	    	            { period: '2011 Q2', iphone: 5670, ipad: 4293, itouch: 1881 },
	    	            { period: '2011 Q3', iphone: 4820, ipad: 3795, itouch: 1588 },
	    	            { period: '2011 Q4', iphone: 15073, ipad: 5967, itouch: 5175 },
	    	            { period: '2012 Q1', iphone: 10687, ipad: 4460, itouch: 2028 },
	    	            { period: '2012 Q2', iphone: 8432, ipad: 5713, itouch: 1791 } ],
	    	        xkey: 'period',
	    	        ykeys: ['iphone', 'ipad', 'itouch'],
	    	        labels: ['iPhone', 'iPad', 'iPod Touch'],
	    	        pointSize: 2,
	    	        hideHover: 'auto',
	    	        resize: true,
	    	        lineColors: ['#87d6c6', '#54cdb4','#1ab394'],
	    	        lineWidth:2,
	    	        pointSize:1,
	    	    });
	    		
	    		}
			}
		);	
		
		
	});
	
	
	//table
	$(selector + " .dataTables-example").each(function(){
		$(this).DataTable({
            dom: '<"html5buttons"B>lTfgitp',
            buttons: [
                { extend: 'copy'},
                {extend: 'csv'},
                {extend: 'excel', title: 'ExampleFile'},
                {extend: 'pdf', title: 'ExampleFile'},

                {extend: 'print',
                 customize: function (win){
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit');
                }
                }
            ]

        });

	});
	
	
	
//	sparkline 
	$("span.pie").peity("pie", {
        fill: ['#1ab394', '#d7d7d7', '#ffffff']
    })

    $(".line").peity("line",{
        fill: '#1ab394',
        stroke:'#169c81',
    })
	
}