<?php
class Login extends CI_Controller {

        public function __construct()
        {
                parent::__construct();
                // Your own constructor code
				$this->load->database(); 
				 $this->load->helper(array('form', 'url'));
                 $this->load->library("session");
$this->load->model('Admin_Model');
        }

public function index()
	{
		
		$this->load->view('admin/loginform');
		
	}

public function loginol()
{
	$email=$this->input->post('email');
		$sifre=$this->input->post('password');
		
		$result = $this->Admin_Model->login($email,$sifre);
		if($result) {
				// Kullanıcı var ise bilgileri diziye aktarılıyor
				$sess_array = array();
				foreach($result as $row) {
                 $sess_array = array(
				 'id' => $row->id,
				 'yetki' => $row->yetki,
				 'email' => $row->email,
				 'adi' => $row->adi,
				 'soyadi' => $row->soyadi
				 );
                 // Dizi verileri Codeigniter Session kütüphanesi değişkenlerine aktarılıoyor
                 $this->session->set_userdata('logged_in', $sess_array);
				 
				 redirect(base_url()."admin/home");
			
				 
                 }
          		return TRUE;
          } 
		  else 
		  {
            $this->session->set_flashdata("login_hata","Geçersiz Email yada Şifre!");   
          		
			$this->load->view('admin/loginform');
			
            return FALSE;
          }
	}	
	public function logout()
	{
		 $this->session->unset_userdata('logged_in');
         $this->session->sess_destroy();
         redirect(base_url()."admin/login");
	}
	
	
	
}
?>