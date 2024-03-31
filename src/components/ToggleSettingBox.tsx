const ToggleSettingBox = ({ value }: any) => {
  return (
    <div className={"toggle-box " + value}>
      <div className="toggle-dot"></div>
    </div>
  );
};

export default ToggleSettingBox;