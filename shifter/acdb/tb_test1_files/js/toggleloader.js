var ToggleLoader = function()
{
    var _generateToggleGroup = function( count, object, level )
    {
        var content = "";
        var first = true;
        
        $.each( object, function( header, group )
        {
            if ( first == false )
                content += "</tr><tr style='display:none'>";
            else
                first = false;
            
            var cells = header.split( "|" );
            var padding = " style='padding-left:" + ( 4 + 18 * ( level - 1 ) ) + "px'";
            
            // Workaround for extended identifiers
            if ( cells.length > count )
            {
                var name = cells.slice( 0, cells.length - count + 1 ).join( "|" );
                cells.splice( 0, cells.length - count + 1, name );
            }
            
            $.each( cells, function( index, cell )
            {
                if ( index == cells.length - 1 )
                {
                    var color = cell == 'Y' ? 'high' : ( cell == 'N' ? 'low' : 'excluded' );
                    content += "<td class='toggle-" + color + "'>";
                    content += cell == 'Y' ? 'Yes' : ( cell == 'N' ? 'No' : 'Excluded' );
                    content += "</td>";
                }
                else
                {
                    content += "<td" + ( index == 0 ? padding : "" ) + ">";
                    content += cell;
                    content += "</td>";
                }
            } );
            
            content += "</tr>";
            
            if ( $.isArray( group ) )
            {
                $.each( group, function( rowIndex, row )
                {
                    content += "<tr style='display:none'>";
                    var cells = row.split( "|" );
                    var padding = " style='padding-left:" + ( 4 + 18 * level ) + "px'";
                    
                    // Workaround for extended identifiers
                    if ( cells.length > count )
                    {
                        var name = cells.slice( 0, cells.length - count + 1 ).join( "|" );
                        cells.splice( 0, cells.length - count + 1, name );
                    }
                    
                    $.each( cells, function( cellIndex, cell )
                    {
                        if ( cellIndex == cells.length - 1 )
                            cell = cell == 'Y' ? 'Yes' : ( cell == 'N' ? 'No' : 'Excluded' );
                        
                        content += "<td";
                        content += cellIndex == 0 ? padding : "";
                        content += cell == "-" ? " class='hyphen'>" : ">";
                        content += cell;
                        content += "</td>";
                    } );
                    
                    content += "</tr>";
                } );
            }
            else
            {
                content += "<tr style='display:none'>";
                content += _generateToggleGroup( count, group, level + 1 );
            }
        } );
        
        return content;
    };

    /*-----------------------------------------------------------------------*/

    var _showToggleCoverage = function( tabId, cvg_data )
    {
        if ( !cvg_data )
        {
            $( "#" + tabId ).html( "No coverage data available for selected node." );
            return;
        }
        
        var content = "<table class='border toggle-table'><tr><th>Name</th>";
        
        var transitions = cvg_data.legend.split( "|" );
        $.each( transitions, function( index, value )
        {
            content += "<th>";
            content += value;
            content += "</th>";
        } );
        content += "<th>Toggled</th></tr>";
        
        $.each( cvg_data, function( index, value )
        {
            if ( index != "legend" )
            {
                content += "<tr id='rel-" + index + "'>";
                content += _generateToggleGroup( transitions.length + 2, value, 1 );
            }
        } );
        
        content += '</table>';
        $( '#' + tabId ).html( content );
        
        // Expanding color from the last cell to the whole row
        var tab = $( '#' + tabId );
        tab.find( 'td.toggle-high' ).removeClass( 'toggle-high' ).parent().addClass( 'toggle-high' );
        tab.find( 'td.toggle-low' ).removeClass( 'toggle-low' ).parent().addClass( 'toggle-low' );
        tab.find( 'td.toggle-excluded' ).removeClass( 'toggle-excluded' ).parent().addClass( 'toggle-excluded' );
        
        TableDecorator.addHighlighting( $( '#' + tabId ).children( 'table' ) );
        TableDecorator.addExpanding( $( '#' + tabId ).children( 'table' ) );
        TableDecorator.loadView( Report.nameById[ tabId ], $( '#' + tabId ).children( 'table' ) );
        
        if ( CounterManager.isActive() )
        {
            // Adding tooltips
            var counters = tab.find( ".toggle-static,.toggle-static-last" ).parent().next().nextAll().prev();
            CounterManager.takeOver( counters );
        }
    };
    
    /*-----------------------------------------------------------------------*/

    var _addTab = function( scope, coveritem, active )
    {
        var tabId;
        var tab_data_id = Report._makeTabName( 'toggle', scope );
        
        if ( tab_data_id in Report.idByName )
        {
            if ( active )
            {
                tabId = Report.idByName[ tab_data_id ];
                Report._selectTab( tabId );
                Report._scrollToItem( coveritem );
            }
        }
        else
        {
            tabId = Report._makeTabId();
            Report.idByName[ tab_data_id ] = tabId;
            Report.nameById[ tabId ] = tab_data_id;
            
            // Remove all tabs but summary
            while ( Report.ui.content.find( ".ui-tabs-nav li" ).length - 1 )
                Report._removeTab( Report.ui.content.find( ".ui-tabs-nav li:eq(1)" ) );
            
            // Add tab with details and fill it
            var inst_name = Report._extractNameFromNode( $( "#" + scope ) );
            Report._addTab( tabId, 'Toggle - ' + inst_name );
            _showToggleCoverage( tabId, Report.cvg_data[ scope ].toggle );
            
            if ( active )
            {
                Report._selectTab( tabId );
                Report._scrollToItem( coveritem );
            }
        }
    };
    
    /*-----------------------------------------------------------------------*/
    
    var _publicInterface =
    {
        addTab: _addTab
    };

    return _publicInterface;
}();
