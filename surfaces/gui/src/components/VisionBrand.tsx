import logo from "../assets/macom-logo.svg";

export function VisionBrand() {
  return <div className="vision-brand" aria-label="Vision Beta by MACOM">
    <div>Vision <span className="vision-beta">BETA</span></div>
    <span className="vision-by">by MACOM</span>
  </div>;
}

export function MacomLogo() {
  return <img className="vision-macom-logo" src={logo} alt="MACOM — Partners from RF to Light" />;
}
