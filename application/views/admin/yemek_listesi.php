
    <div class="content">
        <div class="header">
            <div class="stats">
    <p class="stat"><span class="label label-info">5</span> Tickets</p>
    <p class="stat"><span class="label label-success">27</span> Tasks</p>
    <p class="stat"><span class="label label-danger">15</span> Overdue</p>
</div>

            <h1 class="page-title">Tarif Listesi</h1>
                    <ul class="breadcrumb">
            <li><a href="index.html">Anasayfa</a> </li>
            <li class="active">Tarif Listesi</li>
        </ul>

        </div>
        <div class="main-content">
            
			
<div class="btn-toolbar list-toolbar">
    <a href="<?=base_url()?>admin/yemekler/ekle"><button class="btn btn-primary"><i class="fa fa-plus"></i> Yeni Tarif</button></a>
   <p><?=$this->session->flashdata("sonuc")?></p>
  <div class="btn-group">
  </div>
</div>
<table class="table">
  <thead>
    <tr>
      <th>Yemek Adı</th>
      <th>Türü</th>
      <th>Resim</th>
	  
      <th style="width: 3.5em;"></th>
    </tr>
  </thead>
 
  <tbody>
  <?php
  foreach($veri as $rs)
  {
	  ?>
    <tr>
      <td><?=$rs->adi?></td>
      <td><?=$rs->katadi?></td>
      <td> <?php 
	  if ($rs->yemekresim==NULL)
	  {
	  ?> <a href="<?=base_url()?>admin/yemekler/resimekle/<?=$rs->id?>">Resim Ekle</a>
	  <?php
	  }
	  else
	  {?>
	  <img src="<?=base_url()?>uploads/<?=$rs->yemekresim?>" height="40" width="40">
								<?php
	  }
	  ?></td>
	 
	  
      <td>
          <a href="<?=base_url()?>admin/yemekler/duzenle/<?=$rs->id?>"><i class="fa fa-pencil"></i></a>
          <a href="<?=base_url()?>admin/yemekler/sil/<?=$rs->id?>" role="button" data-toggle="modal" onclick="return confirm('Silmek İstediğinizden Eminmisiniz?');"><i class="fa fa-trash-o"></i></a>
      </td>
    </tr>
    <?php
	
  }
	?>
  </tbody>
</table>

<ul class="pagination">
  <li><a href="#">&laquo;</a></li>
  <li><a href="#">1</a></li>
  <li><a href="#">2</a></li>
  <li><a href="#">3</a></li>
  <li><a href="#">4</a></li>
  <li><a href="#">5</a></li>
  <li><a href="#">&raquo;</a></li>
</ul>



</div>
