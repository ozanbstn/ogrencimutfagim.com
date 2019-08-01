<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title><?=$title?></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="kisaaciklama" content="<?=$kisaaciklama?>" />
 <meta name="keywords" content="<?=$keywords?>">
<link href="<?=base_url()?>/assets/css/style.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" type="text/css" href="<?=base_url()?>/assets/css/coin-slider.css" />
<script type="text/javascript" src="<?=base_url()?>/assets/js/cufon-yui.js"></script>
<script type="text/javascript" src="<?=base_url()?>/assets/js/cufon-aller.js"></script>
<script type="text/javascript" src="<?=base_url()?>/assets/js/jquery-1.4.2.min.js"></script>
<script type="text/javascript" src="<?=base_url()?>/assets/js/script.js"></script>
<script type="text/javascript" src="<?=base_url()?>/assets/js/coin-slider.min.js"></script>
</head>
<body>
<div class="main">
  <div class="header">
    <div class="header_resize">
	<?php
	$home="";
	$contact="";
	$hakkimizda="";
	$blog="";
	$tarifler="";
	switch ($page)
	{
		case "home":
		     $home='active';
		     break;
		case "contact":
		     $contact='active';
		     break;
	    case "tarifler":
		      $tarifler='active';
		case "hakkimizda":
		      $hakkimizda='active';	  
	
	};
?>
	
	
	
      <div class="menu_nav">
        <ul>
          <li class="<?=$home?>"><a href="<?=base_url()?>"><span>ANASAYFA</span></a></li>
          <li class="<?=$tarifler?>"><a href="<?=base_url()?>home/tarifler"><span>TARİFLER</span></a></li>
          <li class="<?=$hakkimizda?>"><a href="<?=base_url()?>home/about"><span>HAKKIMIZDA</span></a></li>
          <li class="<?=$blog?>"><a href="<?=base_url()?>home/blog"><span>BLOG</span></a></li>
          <li class="<?=$contact?>"><a href="<?=base_url()?>home/contact"><span>BIZE YAZIN</span></a></li>
        </ul>
      </div>
      <div class="searchform">
        <form id="formsearch" name="formsearch" method="post" action="#">
          <span>
          <input name="editbox_search" class="editbox_search" id="editbox_search" maxlength="80" value="Search our ste:" type="text" />
          </span>
          <input name="button_search" src="<?=base_url()?>/assets/images/search.gif" class="button_search" type="image" />
        </form>
      </div>
      <div class="clr"></div>
      <div class="logo">
         <a href="<?=base_url()?>home"><img src="<?=base_url()?>/assets/images/logom.png" alt=""/></a>
      </div>
      <div class="clr"></div>