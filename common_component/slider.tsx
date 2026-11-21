import { getTrackBackground, Range } from "react-range";

const InputRange = ({ STEP, MIN, MAX, values, handleChanges }) => {
  return (
    <>
      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={(vals) => handleChanges(vals)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '3px',
              width: '100%',
              background: getTrackBackground({
                values: values,
                colors: ["#EDEDED", "#c3935b", "#EDEDED"],
                min: MIN,
                max: MAX,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '17px',
              width: '17px',
              backgroundColor: '#c3935b',
              borderRadius: '50%',
              boxShadow: isDragged ? '0 0 2px 2px rgba(0, 0, 0, 0.3)' : 'none',
            }}
          />
        )}
      />
    </>
  );
};

export default InputRange;
