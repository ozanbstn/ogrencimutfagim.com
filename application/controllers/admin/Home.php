<?php
class Home extends CI_Controller {

        public function __construct()
        {
                parent::__construct();
                // Your own constructor code
				$this->load->database(); 
				 $this->load->helper(array('form', 'url'));
				 $this->load->library("session");
				 $this->load->model('Admin_Model'); // model tanımlaması
        }

public function index()
	{
		$data["title"]="Öğrenci Mutfağı Admin Paneli";
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/content');
		$this->load->view('admin/footer');
	}
public function sayfaayarlari()
	{
		$query=$this->db->get("setting"); 
        $data["veri"]=$query->result(); 
		
		$data["title"]="Öğrenci Mutfağı Admin Paneli";
		$this->load->view('admin/header',$data);
		$this->load->view('admin/sidebar');
		$this->load->view('admin/sayfabilgisi_ekle',$data);
		$this->load->view('admin/footer');
	}

	
public function sayfabilgisi_guncelle($id)
	{
		$data=array(
		'title' => $this->input->post('title'),
		'kisaaciklama' => $this->input->post('kisaaciklama'),
		'hakkimizda' => $this->input->post('hakkimizda'),
		'iletisim' => $this->input->post('iletisim'),
		'email' => $this->input->post('email'),
		'keywords' => $this->input->post('keywords'),
		
		);
		$this->Admin_Model->update_data("setting",$data,$id);
		
		redirect(base_url()."admin/home");
	}	
	
}
?>