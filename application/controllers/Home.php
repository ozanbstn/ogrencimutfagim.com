<?php
class Home extends CI_Controller {

        public function __construct()
        {
                parent::__construct();
                // Your own constructor code
				$this->load->database(); 
				 $this->load->helper(array('form', 'url'));
				 $this->load->library("session");
				 $this->load->model('Database_Model');
        }

public function index()
	{
		$query=$this->db->get("yemekler"); 
        $data["veri"]=$query->result(); 
		$data["page"]="home"; 
		$query=$this->db->get("setting"); 
        $veriler=$query->result(); 
		foreach($veriler as $rs)
		{
		$data["title"]=$rs->title;
		$data["kisaaciklama"]=$rs->kisaaciklama;
		$data["keywords"]=$rs->keywords;
		}
		
		$this->load->view('_header',$data);
		$this->load->view('_slider');
		$this->load->view('_content',$data);
		$this->load->view('_sidebar');
		$this->load->view('_footer');
    }
public function yemekdetay($id)
	{
		

		$result = $this->Database_Model->get_tarif($id);
    if ($result){
		
		$data["veri"] =$result; 
		$veriler=$result;
		foreach($veriler as $rs)
		{
		$data["title"]=$rs->adi;
		$data["kisaaciklama"]=$rs->kisaaciklama;
		$data["keywords"]=$rs->keywords;
		}
		$data["page"]="yemek_detay";
		
        $this->load->view('_header',$data);
		$this->load->view('_buyukresim',$data);
		$this->load->view('_yemek_detay',$data);
		$this->load->view('_sidebar');
		$this->load->view('_footer');
		
		}	
	else {
		$this->load->view('_header',$data);
		$this->load->view('_buyukresim',$data);
		$this->load->view('_yemek_detay',$data);
		$this->load->view('_sidebar');
		$this->load->view('_footer');
	}
		
	}	
	public function contact()
	{
		$query=$this->db->get("setting"); 
        $veriler=$query->result(); 
		$data["page"]="contact"; 
		foreach($veriler as $rs)
		{
		$data["title"]="Bize Ulaşın ".$rs->title;
		$data["kisaaciklama"]=$rs->kisaaciklama;
		$data["keywords"]=$rs->keywords;
		}
		
		$this->load->view('_header',$data);
		$this->load->view('_bize_yazin_formu',$data);
		$this->load->view('_footer');
		
		
	}
	
	public function contact_gonder()
	{
		
		$data=array(
		'adsoy' => $this->input->post('adsoy'),
		'email' => $this->input->post('email'),
		'konu' => $this->input->post('konu'),
		'mesaj' => $this->input->post('mesaj')
		
		);
		
		$this->Database_Model->insert_data("mesajlar",$data); 
		
		 $adsoy=$this->input->post('adsoy');
		 $email=$this->input->post('email');
		 
		 $query=$this->db->get("setting"); 
        $data["veri"]=$query->result(); 
		 
		 
		 $config= Array(
		 'protocol' => 'smtp',
		 'smtp_host' => $data["veri"][0]->smtpserver,
		 'smtp_port' => $data["veri"][0]->smtpport,
		 'smtp_user' => $data["veri"][0]->smtpemail,
		 'smtp_pass' => $data["veri"][0]->password,
		 'mailtype' => 'html',
		 'charset' => 'utf-8',
		 'wordwrap' => TRUE
		 );
		 
		 $mesaj="Değerli : ".$adsoy."<br> Göndermiş olduğunuz mesaj alınmıştır.<br>Teşekkür ederiz<br>";
		 $mesaj.="=====================================================================<br>";
		 $mesaj.=$data["veri"][0]->title."<br>";
		 $mesaj.=$data["veri"][0]->adres."<br>";
		 $mesaj.=$data["veri"][0]->sehir."<br>";
		 $mesaj.=$data["veri"][0]->hakkimizda."<br>";
		 $mesaj.=$data["veri"][0]->iletisim."<br>";
		 $mesaj.=$data["veri"][0]->email."<br>";
		 $mesaj.="Gönderdiğiniz mesaj aşağıdaki gibidir<br>======================<br>";
		 $mesaj.=$this->input->post('mesaj');
			 
		 $this->load->library('email', $config);
         $this->email->set_newline("\r\n");
		 $this->email->from($data["veri"][0]->smtpemail);
		 $this->email->to($email);
		 $this->email->subject($data["veri"][0]->title. "İletişim Mesajı");
		 $this->email->message($mesaj);
			 
		if($this->email->send())
            $this->session->set_flashdata("email_sent","Email Başarı ile gönderildi.");
       else{
		   $this->session->set_flashdata("email_sent","Email gönderilemedi.");
		   show_error($this->email->print_debugger());
	   }
		   
		   
		$this->session->set_flashdata("mesaj_send","En yakın sürede size dönüş yapacağız."); 
		redirect(base_url()."home/contact");
		   
	   }		
			 
			 		 
		
	
	
	
	
	
}
	