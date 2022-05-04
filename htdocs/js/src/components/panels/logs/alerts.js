 /*
  * This file is part of evQueue
  *
  * evQueue is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * evQueue is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
  *
  * Author: Thibault Kummer
  */

'use strict';

import {evQueueComponent} from '../../base/evqueue-component.js';
import {Panel} from '../../../ui/panel.js';
import {Dialogs} from '../../../ui/dialogs.js';
import {EditAlert} from '../../dialogs/logs/edit-alert.js';

export class Alerts extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.alerts = [];
		
		this.editAlert = this.editAlert.bind(this);
	}
	
	componentDidMount() {
		let api = {group:'alerts',action:'list'};
		
		this.Subscribe('ALERT_CREATED',api,false);
		this.Subscribe('ALERT_MODIFIED',api,false);
		this.Subscribe('ALERT_REMOVED',api,true);
	}
	
	evQueueEvent(data) {
		this.setState({alerts: this.parseResponse(data).response});
	}
	
	editAlert(e, id) {
		Dialogs.open(EditAlert, {id: id});
	}
	
	removeAlert(e, id) {
		this.simpleAPI({
			group: 'alert',
			action: 'delete',
			attributes: {id: id}
		},"Alert removed", "Are you sure you want to remove this alert ?");
	}
	
	renderAlerts() {
		return this.state.alerts.map(alert => {
			let trigger_desc = alert.occurrences;
			if(alert.groupby)
			{
				if(alert.groupby.substr(0, 6)=='group_')
					trigger_desc += ' / '+alert.groupby.substr(6)+' (group)';
				else if(alert.groupby.substr(0, 8)=='channel_')
					trigger_desc += ' / '+alert.groupby.substr(8)+' (channel)';
			}
			if(alert.period==1)
				trigger_desc += ' / minute';
			else
				trigger_desc += ' / '+alert.period+' minutes';
			
			return (
				<tr key={alert.id}>
					<td>{alert.name}</td>
					<td>{alert.description}</td>
					<td>{trigger_desc}</td>
					<td className="center">
						<span className="faicon fa-edit" title="Edit alert" onClick={ (e) => this.editAlert(e, alert.id) } />
						<span className="faicon fa-remove" title="Remove alert" onClick={ (e) => this.removeAlert(e, alert.id) } />
					</td>
				</tr>
			);
		});
	}
	
	render() {
		var actions = [
			{icon:'fa-file-o', title: "Create new channel", callback:this.editAlert}
		];
		
		return (
			<div className="evq-logs-alerts">
				<Panel noborder left="" title="External logs alerts" actions={actions}>
					<table className="evenodd">
						<thead>
							<tr>
								<th style={{width: '10rem'}}>Name</th>
								<th>Description</th>
								<th style={{width: '16rem'}}>Trigger</th>
								<th style={{width: '10rem'}}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderAlerts() }
						</tbody>
					</table>
				</Panel>
			</div>
		);
	}
}
