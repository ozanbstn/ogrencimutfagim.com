  <div class="content">
    <div class="content_resize">
      <div class="mainbar">
         <!--CONTENT-->
	  
      <div class="mainbar">
        
		
		<div class="content">
    <div class="fbg_resize">
      <div class="col c1">
        <h2><span>Son</span> Tarİfler</h2>
	  <table class="table">
  <thead>
  <tr>
  <?php
  $say=0;
  foreach($veri as $rs)
  { 
     if ($say<3)
		 {
	?>
<th><a href="<?=base_url()?>home/yemekdetay/<?=$rs->id?>"><img src="<?=base_url()?>uploads/<?=$rs->yemekresim?>" width="150" height="150" alt="" class="gal" /></a></th>
<th style="width: 3.5em;"></th>
	 <?php
	 }
	 $say++;
  }
	?>
	</tr>
  </thead>
  <tr>
  <?php
  $say=0;
  foreach($veri as $rs)
  { 
     if ($say<3)
		 {
	?>
      <th><?=$rs->adi?></th>
      <th style="width: 3.5em;"></th>
	   <?php
	 }
	 $say++;
  }
	?>
    </tr>
	<tr>
	<?php
  $say=0;
  foreach($veri as $rs)
  { 
     if ($say<3)
		 {
	?>
      <th><a href="<?=base_url()?>home/yemekdetay/<?=$rs->id?>" class="button"><img src="<?=base_url()?>/assets/images/detay.png" alt=""/></a><br></th>  
      <th style="width: 3.5em;"></th>
	  <?php
	 }
	 $say++;
  }
	?>
    </tr>
  </table>
  </div>
   <div class="col c1">
        <h2><span>BİZİM</span> SEÇTİKLERİMİZ</h2>
	  <table class="table">
  <thead>
  <tr>
  <?php
  
  for( $say=4; $say>1; $say-- )
  { 
    
	?>
<th><a href="<?=base_url()?>home/yemekdetay/<?=$veri[$say]->id?>"><img src="<?=base_url()?>uploads/<?=$veri[$say]->yemekresim?>" width="150" height="150" alt="" class="gal" /></a></th>
<th style="width: 3.5em;"></th>
	 <?php
	 
	
  }
	?>
	</tr>
  </thead>
  <tr>
  <?php
  
  for( $say=4; $say>1; $say-- )
  { 
    
	?>
	
      <th><?=$veri[$say]->adi?></th>
      <th style="width: 3.5em;"></th>
	   <?php
	
  }
	?>
    </tr>
	<tr>
	<?php
  
  for( $say=4; $say>1; $say-- )
  { 
    
	?>
      <th><a href="<?=base_url()?>home/yemekdetay/<?=$veri[$say]->id?>" class="button"><img src="<?=base_url()?>/assets/images/detay.png" alt=""/></a><br></th>  
      <th style="width: 3.5em;"></th>
	  <?php
	 
  }
	?>
    </tr>
  </table>
  </div>
      <div class="clr"></div>
    </div>
  </div>
		
		
		
		
      </div>
	  
	  
	  <!--CONTENT-->
      </div>
   