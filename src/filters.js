export default{
    btc_format: function (value,n,denom) {
        if(!n)n=8;
        if(!denom)denom=8;
        denom=Math.pow(10,denom);
        value = value/denom;
        const v = value.toString().split('.');
        if (n <= 0) return v[0];
        var f = v[1] || '';
        if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
        while (f.length < n) f += '0';
        return `${v[0]}.${f}`;
    }
}
