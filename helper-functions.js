// https://henry.codes/writing/how-to-map-a-number-between-two-ranges/
export function mapRanges(num, input_min, input_max, output_min, output_max) {
    return ((num - input_min) / (input_max - input_min) * (output_max - output_min) + output_min);
}