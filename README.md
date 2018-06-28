# FAIRsharing-client
Modular-based components for the FAIRsharing web user interface and the FAIRsharing widget

## FAIRsharing collection widget
This widget exposes a collection or recommendation from [FAIRsharing](https://fairsharing.org). These can be viewed either as a table or a networked graph. Changes applied to one view are reflected on the other.

### Table View
Each record is represented by a row in the table. As a default, the records are sorted on their Abbreviation. The order of the resources can be changed by clicking on the column headings.
The first column details the type of record - database, standard or policy. The final column (status) displays whether the resource is ready (R - i.e. maintained, ready for use by the community), under development (DEV - the resource is in development and isn't quite ready for use or implementation), deprecated (D - the resource is no longer maintained), or status uncertain (U - where we are unsure as to the status of the resource).
Resources can be filtered clicking on the 'domains' and 'applied species' tags. Only one filter per column can be applied at a time.Clicking on the resource name opens the full FAIRsharing resource record in a new window.
NOTE: The table view only shows the resources in the collection/recommendation itself, rather than including those that can be seen when the 'outer' button is selected on the graph view.
 
### Graph View
This view displays the network of relationships among the resources in the collection or recommendation.
The resources can be moved around the graph to provide the best view of the data.
Clicking on a resource brings up some synopsis information, and a link to the full record on FAIRsharing.
Clicking on 'Show the tags panel' brings up all the domains and species associated with the resources displayed in the graph.
These can be selected or removed to filter the resources visible in the graph. The resource tick boxes can be used to filter out resource types.
As a default, only the resources mentioned in a collection or recommendation are displayed. Clicking on the 'outer' option results in all the resources that are related to those in the recommendation, be they standards that are implemented by the databases in the recommendation, or other related databases, being displayed in grey as an outer ring. The graph can be displayed using a force-field (COSE) or circular (COLA) layout. The COSE layout is the default. For more information on the recommendation, or the resources therein, please see the [FAIRsharing](https://fairsharing.org) website.
