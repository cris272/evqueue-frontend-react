<?php
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
  * Authors: Nicolas Jean, Christophe Marti 
  */

require_once 'inc/auth_check.php';
require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';

$xsl = new XSLEngine();
if(isset($_GET['display']) && $_GET['display'] == 'state') {
	$xml = $xsl->Api('workflow_schedules', 'list'); //TODO : filtre active only
	$xsl->SetParameter('DISPLAY', 'state');
}
else{
	$xml = $xsl->Api('workflow_schedules', 'list');
	$xsl->SetParameter('DISPLAY', 'settings');
}
$xsl->AddFragment(['schedules' => $xml]);


$dom = new DOMDocument();
$dom->loadXML($xml);
$xpath = new DOMXpath($dom);
$schedules = $xpath->evaluate('/response/workflow_schedule/@id');
foreach($schedules as $schedule){
	$xsl->AddFragment(["workflow-schedules-instance" => $xsl->Api("instances", "list", ['filter_schedule_id' => $schedule->nodeValue, 'limit' => 1])]);
}

$xsl->AddFragment(["workflows" => $xsl->Api("workflows", "list")]);

$xsl->AddFragment(["status" => $xsl->Api("status", "query", ['type' => 'scheduler'])]);

/*
foreach ($QUEUEING as $node_name => $conf) {
	$wfi = new WorkflowInstance($node_name);
	$next_exec_time = $wfi->GetNextExecutionTime();
	if ($next_exec_time)
		$xsl->AddFragment($next_exec_time);
}*/

$xsl->DisplayXHTML('xsl/list_workflow_schedules.xsl');

?>