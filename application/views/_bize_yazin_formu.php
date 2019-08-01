  <div class="content">
  <?php 
     if($this->session->flashdata("mesaj_send")) 
		 { 
		 ?>
		 <img src="<?=base_url()?>/assets/images/mesajgonderildi.png" alt=""/>
    <p><?=$this->session->flashdata("mesaj_send")?></p>
	<p><?=$this->session->flashdata("email_sent")?></p>
	<?php
		 }
		 ?>
	 <h2><span>BİZE YAZIN</span></h2>
          <div class="clr"></div>
          <p>Soru, görüş, öneri ve isteklerinizi bize iletin.</p>
        </div>
        <div class="article">
          <h2><span>İLETİŞİM</span> FORMU</h2>
          <div class="clr"></div>
		   <script>
		 function validateForm() {
   
    if (document.forms["myForm"]["adsoy"].value == "") {
        alert("Adınız ve Soyadınız Boş Olamaz");
        return false;
    }
	 if (document.forms["myForm"]["email"].value == "") {
        alert("Email Boş Olamaz");
        return false;
    }
	 if (document.forms["myForm"]["konu"].value == "") {
        alert("Konu Boş Olamaz");
        return false;
    }
	 if (document.forms["myForm"]["mesaj"].value == "") {
        alert("Mesaj Boş Olamaz");
        return false;
    }
}
</script>
          <form action="<?=base_url()?>/home/contact_gonder" name="myForm" onsubmit="return validateForm()" method="post" id="myForm">
            <ol>
              <li>
                <label for="name"><h3>Adınız ve Soyadınız:</h3></label>
                <input type="text" id="adsoy" name="adsoy" rows="10" cols="50" />
              </li>
              <li>
                <label for="email"><h3>Email Adresiniz:</h3></label>
                <input id="email" name="email" rows="10" cols="50" />
              </li>
              <li>
                <label for="konu"><h3>Konu:</h3></label>
                <input id="konu" name="konu" rows="10" cols="50" />
              </li>
              <li>
                <label for="mesaj"><h3>Mesajınız:</h3></label>
                <textarea id="mesaj" name="mesaj" rows="8" cols="50"></textarea>
              </li>
              <li>
                <input type="image" class="send" src="<?=base_url()?>/assets/images/gonder.png" />
                <div class="clr"></div>
              </li>
            </ol>
          </form>
        </div>
      </div>
	