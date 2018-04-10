var CovergroupLoader = function()
{
    var _showCvgCoverage = function( tabId, coverage )
    {
        var table_rows = [];
        var inInstance;
        var hasAttributes = false;

        $.each( coverage, function( index, row )
        {
            var rowStr = '';

            var rowId = '';
            if ( row.rel )
                rowId = 'id="rel-' + row.rel + '"';

            var rowClass = 'cvg-' + row.status.toLowerCase();
            if ( row.type == 'bin' )
            {
                if ( row.bin_type[ 0 ] )
                    rowClass += ' cvg-' + row.bin_type[ 0 ];

                rowStr += '<tr ' + rowId + ' class="cvg-bin ' + rowClass + '">';
            }
            else
                rowStr += '<tr ' + rowId + ' class="cvg-scope ' + rowClass + '">';
            
            var padding = 4;
            padding = row.type == "instance" ? 22 : padding;
            padding = row.type == "coverpoint" || row.type == "cross" ? 22 + inInstance * 18 : padding;
            padding = row.type == "bin" ? 40 + inInstance * 18 : padding;
            rowStr += '<td style="padding-left: ' + padding + 'px">';

            if ( row.type != "bin" )
                rowStr += '<span class="cvg-type">' + row.type.toUpperCase() + '</span> <span class="cvg-name">';
            else
            {
                rowStr += row.bin_type.join( ' ' );

                if ( row.bin_type.length )
                    rowStr += ' ';
                
                rowStr += row.type + ' ';
            }

            rowStr += Tools.forceWhiteSpaces( row.data );
            rowStr += row.data[ row.data.length - 1 ] == "\n" ? "&nbsp;" : "";

            if ( row.type != "bin" )
                rowStr += "</span>";

            rowStr += '</td><td class="cvg-hits">' + row.hits;
            rowStr += '</td><td class="cvg-goal' + ( row.goal == "-" ? " hyphen" : "" ) + '">' + row.goal;
            rowStr += '</td><td class="cvg-status">' + row.status;            
            rowStr += "</td><td>";
            
            if ( row.user )
            {
                hasAttributes = true;
                
                $.each( row.user, function( key, value )
                {
                    rowStr += key;
                    rowStr += " = ";
                    rowStr += Tools.forceWhiteSpaces( value );
                    rowStr += "<br />";
                } );
                
                rowStr = rowStr.slice( 0, -6 );
            }
            
            rowStr += "</td>";

            if ( Report.cvg_data.summary.options.option + Report.cvg_data.summary.options.ranges > 0 )
            {
                rowStr += '<td>';

                if ( row.extra )
                {
                    rowStr += Tools.forceWhiteSpaces( row.extra );
                    rowStr += row.extra[ row.extra.length - 1 ] == "\n" ? "&nbsp;" : "";
                }

                rowStr += '</td>';
            }

            rowStr += '</tr>';
            table_rows.push( rowStr );
            
            if ( row.type == "instance" )
                inInstance = true;
            else if ( row.type == "type" )
                inInstance = false;
        } );

        if ( table_rows.length == 0 )
        {
            $( '#' + tabId ).html( "No coverage data available for selected node." );
            return;
        }
        
        var content = $( "#template-cvg table" ).clone().append( table_rows.join( '' ) );
        $( '#' + tabId ).html( content );
        
        TableDecorator.addHighlighting( $( "#" + tabId ).children( "table" ) );
        TableDecorator.addExpanding( $( '#' + tabId ).children( 'table' ) );
        TableDecorator.loadView( Report.nameById[ tabId ], $( '#' + tabId ).children( 'table' ) );
        
        if ( CounterManager.isActive() )
        {
            var counters = $( "#" + tabId ).find( ".toggle-static,.toggle-static-last" ).parent().next();
            CounterManager.takeOver( counters );
        }
        
        if ( !hasAttributes )
            $( "#" + tabId ).find( "th:nth-child(5),td:nth-child(5)" ).css( "display", "none" );

        if ( Report.cvg_data.summary.options.option + Report.cvg_data.summary.options.ranges == 0 )
            $( '#' + tabId + ' tr > th:last' ).css( 'display', 'none' );
    };
    
    /*-----------------------------------------------------------------------*/

    var _addTab = function( scope, coveritem, active )
    {
        var tabId;
        var tab_data_id = Report._makeTabName( 'cvg', scope );

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

            var cvg_data = Report.cvg_data[ scope ].cvg;
            var inst_name = Report._extractNameFromNode( $( "#" + scope ) );

            // Remove all tabs but summary
            while ( Report.ui.content.find( ".ui-tabs-nav li" ).length - 1 )
                Report._removeTab( Report.ui.content.find( ".ui-tabs-nav li:eq(1)" ) );

            Report._addTab( tabId, 'Covergroup - ' + inst_name );
            _showCvgCoverage( tabId, cvg_data );
            
            if ( active )
            {
                Report._selectTab( tabId );
                Report._scrollToItem( coveritem );
            }
        }
    };

    /*-----------------------------------------------------------------------*/

    var _loadCvgAllCoverage = function( item_id )
    {
        var tabId;
        
        if ( 'cvg::all::details' in Report.idByName )
        {
            if ( item_id == 'w0' )
            {
                // Rewind details
                tabId = Report.idByName[ 'cvg::all::details' ];
                Report._selectTab( tabId );
                $( '#' + tabId ).scrollTop( 0 );
                
                // Rewind summary
                tabId = Report.idByName[ 'cvg::all::summary' ];
                Report._selectTab( tabId );
                $( '#' + tabId ).scrollTop( 0 );
            }
            else
            {
                // Rewind summary
                tabId = Report.idByName[ 'cvg::all::summary' ];
                Report._selectTab( tabId );
                $( '#' + tabId ).scrollTop( 0 );
                
                // Show chosen item
                tabId = Report.idByName[ 'cvg::all::details' ];
                Report._selectTab( tabId );
                Report._scrollToItem( item_id );
            }
        }
        else
        {
            // Remove all tabs
            while ( Report.ui.content.find( "ul.ui-tabs-nav li" ).length )
                Report._removeTab( Report.ui.content.find( ".ui-tabs-nav li:eq(0)" ) );
            
            // Add tab with summary
            tabId = Report._makeTabId();
            Report.idByName[ 'cvg::all::summary' ] = tabId;
            Report.nameById[ tabId ] = 'cvg::all::summary';
            Report._addTab( tabId, 'Covergroups - Summary' );
            
            // Choose summary with all covergroups
            var summary = {};
            $.extend( summary, ( Report.cvg_data.summary.du || {} ).summary );
            $.extend( summary, Report.cvg_data[ 'cvg-all' ].summary );
            
            // Turn on column with recursive statistics
            summary.wa_recursive = true;
            
            // Reject data other than functional coverage
            var deleteMode = true;
            summary.statistics = $.grep( summary.statistics || [], function( element )
            {
                if ( element.status )
                    deleteMode = element.data != 'Covergroup Coverage';
                
                return !deleteMode;
            } );

            // Is there anything to show?
            if ( summary.statistics.length == 0 )
            {
                $( '#' + tabId ).html( "No data to display." );
                return;
            }
            
            // Add table to tab
            var rows = [];
            Report._generateSummaryTable( summary, rows, "Hits/Total", "Hits/Total" );
            var content = $( "#template-summary > table" ).clone().append( rows.join( '' ) );
            $( '#' + tabId ).html( content );
            TableDecorator.addHighlighting( $( "#" + tabId ).children( "table" ) );

            // Add exclusions to tab
            if ( Report.cvg_data[ 'cvg-all' ].exclusions )
            {
                content = "<p class='summary-footer'>EXCLUSIONS";
                $.each( Report.cvg_data[ 'cvg-all' ].exclusions, function( index, value )
                {
                    content += "<br>" + Tools.escapeHTML( value );
                } );
                content += "</p>";
                $( '#' + tabId ).append( content );
            }
            
            // Add tab with details
            tabId = Report._makeTabId();
            Report.idByName[ 'cvg::all::details' ] = tabId;
            Report.nameById[ tabId ] = 'cvg::all::details';
            Report._addTab( tabId, 'Covergroups - Details' );
            _showCvgCoverage( tabId, Report.cvg_data[ 'cvg-all' ].cvg );
            
            if ( item_id != 'w0' )
            {
                // Show chosen item
                Report._selectTab( tabId );
                Report._scrollToItem( item_id );
            }
        }

        if ( item_id == "w0" )
            Report._addInfoTab();
        else if ( Report.ui.content.find( "ul.ui-tabs-nav li" ).length == 3 )
            Report._removeTab( Report.ui.content.find( ".ui-tabs-nav li:eq(2)" ) );
    };

    /*-----------------------------------------------------------------------*/

    var _loadCvgAllStatistics = function()
    {
        Report._saveView();
        $( ".tree-view" ).not( this ).jstree( "deselect_all" );

        var node_id = $( this ).jstree( "get_selected" )[ 0 ];
        _loadCvgAllCoverage( node_id );
    };

    /*-----------------------------------------------------------------------*/

    var _loadTree = function()
    {
        var options = $.extend( {}, Report.BASIC_TREE_OPTIONS );
        options.core.data = Report.tree_data[ 'cvg-all' ];
        $.extend( options.core.data, { state: { opened: true } } );
        options.core.worker = false;
        $( "#accord-tree-cvg" ).bind( "redraw.jstree open_node.jstree", Report._removeLocation );
        $( "#accord-tree-cvg" ).jstree( options ).bind( "select_node.jstree", _loadCvgAllStatistics );
    };

    /*-----------------------------------------------------------------------*/

    var _selectRoot = function()
    {
        var tree = $( "#accord-tree-cvg" );
        
        // Select root without animation
        var state = tree.jstree( "get_state" );
        state.core.selected = [ "w0" ];
        tree.jstree( "set_state", state );
        
        _loadCvgAllStatistics.call( tree );
        
        // Deselect root without animation
        state = tree.jstree( "get_state" );
        state.core.selected = [];
        tree.jstree( "set_state", state );
    };
    
    /*-----------------------------------------------------------------------*/
    
    var _publicInterface =
    {
        addTab: _addTab,
        loadTree: _loadTree,
        selectRoot: _selectRoot
    };

    return _publicInterface;
}();
